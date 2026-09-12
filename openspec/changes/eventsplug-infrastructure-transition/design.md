## Context

EventsPlug is a NestJS + Next.js + Vite monorepo (turborepo). The backend uses Prisma/PostgreSQL and has an existing JWT auth system, RBAC via guards, and rate limiting via `@nestjs/throttler` (currently in-memory store). The embeddable widget is a native Web Component (`CustomElement`) built in the `apps/widget` Vite project. There is no message queue or external email service currently.

The transition adds Redis as a second persistent dependency, Resend as a transactional email provider, and reshapes the registration model to support identity-based deduplication and explicit status lifecycle. All new async side-effects (email, webhooks) are decoupled from the HTTP request path via BullMQ queues.

## Goals / Non-Goals

**Goals:**
- Add event-scoped widget embed as the primary developer-facing surface
- Introduce a registration state machine with identity-based deduplication enforced at the DB level
- Enable external developer API access via org-scoped API keys (alternate auth path to JWT)
- Deliver async email (Resend) and webhooks (signed, retriable) via BullMQ + Redis
- Add `CLOSED` event status and the four V1 webhook event types
- Add cursor-based pagination to all list endpoints before data volume becomes a problem

**Non-Goals:**
- Waitlist / automatic promotion (scoped to `attendee-lifecycle` change)
- QR code check-in (scoped to `attendee-lifecycle` change)
- Payments changes
- Multi-tenant team management
- Public-facing docs site (Swagger UI via NestJS is sufficient for V1)
- Gmail-specific email normalization tricks (dots, plus-tags)

## Decisions

### D1: Dual-mode widget via attribute detection

**Decision:** The Web Component detects `event-id` attribute first; if absent, falls back to `org` attribute (existing behavior). The two modes share one bundle.

**Rationale:** Backwards compatibility with existing org-hub embeds at zero cost. Event-scoped mode needs a new public backend endpoint (`GET /api/events/:eventId/public`) that returns event + form fields without requiring org slug.

**Alternative considered:** Two separate custom elements (`<events-plug-event>` vs `<events-plug-widget>`). Rejected: doubles bundle surface, complicates versioning.

### D2: Registration identity abstraction

**Decision:** Add `identityValue: String` and `identityType: IdentityType` to `Registration`. Add `isIdentityField: Boolean` to `FormField`. Enforce `UNIQUE(eventId, identityValue)` at the database level. In V1, the only valid `identityType` is `EMAIL`. Normalize with `.trim().toLowerCase()` — no provider-specific tricks.

**Rationale:** DB-level constraint prevents race conditions (check-then-insert is not safe under concurrent load). The `identityType` field makes the abstraction extensible to `PHONE` or `CUSTOM` in future without schema redesign.

**Alternative considered:** Email uniqueness check in application code only. Rejected: race condition window under concurrent submission.

**Alternative considered:** Hard-code email column on `Registration`. Rejected: too inflexible; identity concept is cleaner.

### D3: BullMQ + Redis for all async side-effects

**Decision:** All post-registration side-effects (email, webhook delivery) go through BullMQ queues. Two queues: `email-notifications`, `webhook-delivery`. Workers run in the NestJS process for simplicity (no separate worker service in V1).

**Rationale:** Decouples HTTP response from external service latency (Resend, customer webhook URLs). BullMQ's built-in retry with exponential backoff handles transient failures without custom retry logic. In-process workers avoid operational complexity of a separate worker process for V1.

**Alternative considered:** Separate NestJS worker app. Rejected for V1: extra operational complexity. Migration path is clear if queue depth becomes a concern.

**Alternative considered:** Simple `Promise.allSettled` fire-and-forget. Rejected: no retry, no observability, webhook delivery guarantee is a product promise.

### D4: Redis throttler store

**Decision:** Migrate `@nestjs/throttler` from in-memory to Redis store (`@nestjs-throttler-storage-redis`) once Redis is available. Rate limit keying: for public endpoints, key by IP; for API-key-authenticated endpoints, key by API key prefix.

**Rationale:** In-memory throttler state is lost on restart and doesn't work behind multiple backend instances. Redis store is stateless-instance-safe.

### D5: API key auth as an alternate identity resolution layer

**Decision:** A new `ApiKeyGuard` checks for `X-API-Key` header before falling back to JWT. Both guards resolve to `{ organizationId, userId?: string }` on `req.user`. Downstream service code is unchanged — it already reads `req.user.organizationId`.

**Rationale:** Minimal blast radius. No new permission model — API keys inherit org-level access. Rate limiting can be keyed per API key.

**Alternative considered:** Separate controller routes for API key vs. JWT access. Rejected: duplicates all route handlers.

### D6: Webhook payload envelope

**Decision:** Fixed envelope for all webhook events:

```json
{
  "id": "wh_<uuid>",
  "type": "registration.created",
  "createdAt": "<ISO8601>",
  "data": { ... }
}
```

Payload for `registration.created` / `registration.cancelled` includes `event.id` and `registration.id`, `registration.status`, `registration.createdAt`. Does NOT automatically serialize all form answers — that's an explicit V2 opt-in.

Headers: `X-EventsPlug-Event`, `X-EventsPlug-Delivery`, `X-EventsPlug-Signature`.

Signature: `sha256=HMAC-SHA256(signingSecret, rawBody)`. Signing secret is per-webhook-endpoint, generated at creation.

**Rationale:** Intentional payload contract prevents accidental PII leakage through auto-serialization of form answers. Delivery ID enables idempotent receivers. Signature enables tamper verification.

### D7: Cursor-based pagination

**Decision:** All list endpoints (registrations, events) adopt cursor-based pagination using `createdAt + id` as the cursor, encoded as base64 JSON. Default page size 50, max 100.

**Rationale:** Offset pagination degrades on large datasets. Cursor pagination is stable under concurrent inserts. Consistent with how developer-facing APIs (Stripe, etc.) work.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Redis becomes a single point of failure | BullMQ jobs are persisted in Redis; if Redis is down, email/webhooks queue but HTTP registrations still succeed (side-effects are async). Dashboard shows queue health. |
| In-process BullMQ workers compete with HTTP handlers for CPU | Acceptable in V1 at low volume. Clear migration path to separate worker process. |
| Webhook endpoint is customer-controlled (SSRF risk) | Restrict delivery to HTTPS only. Block private IP ranges in the webhook delivery worker. |
| Email confirmation hits Resend rate limits at scale | BullMQ queue + retry absorbs bursts. Resend tier limits are generous for V1 traffic. |
| DB unique constraint error on concurrent registration | Caught at DB level; application maps `P2002` Prisma error to a `409 Conflict` with clear message. |
| Widget bundle grows with dual-mode logic | Mode detection is a single attribute check. Shared fetch/render logic. Expected bundle delta < 1 KB. |

## Migration Plan

1. Add Redis to `docker-compose.yml`; document `REDIS_URL` in `.env.example`
2. Run Prisma migrations in sequence:
   - Add `isIdentityField` to `FormField`
   - Add `identityValue`, `identityType`, `status` to `Registration` (nullable initially; backfill = empty string for existing rows)
   - Add unique constraint `Registration(eventId, identityValue)` — safe after backfill since existing rows have `identityValue = ''` and are not subject to duplicate check
   - Add `CLOSED` to `EventStatus` enum
   - Create `ApiKey` model
   - Create `WebhookEndpoint` model
3. Deploy backend with new modules — all existing routes unchanged
4. Deploy widget with dual-mode support — existing `org` attribute behaviour unchanged
5. Enable throttler Redis store (swap store adapter)

## Open Questions

- None. All design decisions are locked per product discussion.
