## Why

EventsPlug is currently a form builder with event branding — useful, but undifferentiated. The transition repositions it as embeddable event-registration infrastructure for developers and organizations: a coherent product with a registration engine, signed webhooks, external API keys, and an event-scoped embeddable widget as the primary surface.

## What Changes

- **Event-scoped embeddable widget**: New primary embed mode targeting a single event by ID (`event-id` attribute), alongside the existing org-hub widget which is preserved.
- **Registration identity and duplicate prevention**: `FormField` gains an `isIdentityField` flag. One identity field per form (must be type `EMAIL`). Registrations store a normalized `identityValue` and `identityType`. Uniqueness is enforced at the DB level via a `UNIQUE(eventId, identityValue)` constraint.
- **Registration status and cancellation**: `Registration` gains a `status` field (`CONFIRMED`, `CANCELLED`). New cancellation endpoint with transactional state updates.
- **API keys**: Org-scoped API keys with SHA-256 hashing, prefix display, revocation, and last-used tracking. Enables external developer access to the REST API without requiring JWT session auth.
- **Async job infrastructure**: BullMQ + Redis added as core infrastructure. Two queues: `email-notifications` and `webhook-delivery`.
- **Transactional email via Resend**: Confirmation email on registration. Organizer notification on new registration. Cancellation email. All delivered via BullMQ queue.
- **Webhooks**: Org-configurable webhook endpoints. Signed payloads (HMAC-SHA256). Consistent envelope with delivery IDs. Exponential retry via BullMQ. Four event types in V1: `registration.created`, `registration.cancelled`, `event.published`, `event.closed`.
- **API pagination**: Cursor-based pagination on all list endpoints (registrations, events) before data volumes make pagination urgent.
- **EventStatus `CLOSED`**: New status enum value for explicitly closed events.
- **Docker Compose**: Redis service added.

## Capabilities

### New Capabilities

- `api-keys`: Org-scoped external API keys — creation, hashing, revocation, auth guard
- `webhooks`: Webhook endpoint configuration, signed async delivery via BullMQ, retry logic, 4-event V1 catalog
- `email-notifications`: Resend-based transactional emails via BullMQ queue — confirmation, organizer alert, cancellation
- `job-infrastructure`: BullMQ + Redis wiring, queue module, worker scaffolding shared by webhooks and email

### Modified Capabilities

- `registrations`: Add `status`, `identityValue`, `identityType` fields; add DB-level unique constraint on `(eventId, identityValue)`; add cancellation endpoint; add `registration.created` / `registration.cancelled` webhook emission
- `events`: Add `CLOSED` to `EventStatus` enum; add `event.published` / `event.closed` webhook emission; new public endpoint `GET /api/events/:eventId/public` for event-scoped widget
- `widget`: Add event-scoped embed mode (`event-id` attribute); dual-mode routing logic in Web Component
- `auth`: New auth guard that accepts either JWT or `X-API-Key` header; resolves to `organizationId` for downstream services

## Impact

- **New infrastructure dependency**: Redis (BullMQ). Added to `docker-compose.yml` and `.env.example`.
- **New env vars**: `REDIS_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `WEBHOOK_SIGNING_SECRET` (per-org or global seed).
- **Database migrations**: `FormField.isIdentityField`, `Registration.status`, `Registration.identityValue`, `Registration.identityType`, new `ApiKey` model, new `WebhookEndpoint` model, unique constraint on `Registration(eventId, identityValue)`.
- **Backend**: New NestJS modules — `api-keys`, `webhooks`, `email`, `jobs`. Modified modules — `registrations`, `events`, `auth`.
- **Widget** (`apps/widget`): Dual-mode attribute detection, new event-scoped fetch path.
- **Dashboard**: API key management UI, webhook endpoint configuration UI, registration status display, cancellation action.
- **Shared packages**: `@eventflow/types` updated with new enums (`RegistrationStatus`, `WebhookEventType`, `IdentityType`).
