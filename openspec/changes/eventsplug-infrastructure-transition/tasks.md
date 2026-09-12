## 1. Infrastructure Setup

- [x] 1.1 Add Redis service to `docker-compose.yml` with health check
- [x] 1.2 Add `REDIS_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` to `.env.example`
- [x] 1.3 Install BullMQ and NestJS BullMQ adapter (`@nestjs/bullmq`, `bullmq`) in backend `package.json`
- [x] 1.4 Install `@nestjs-throttler-storage-redis` and migrate throttler from in-memory to Redis store
- [x] 1.5 Install Resend SDK (`resend`) in backend `package.json`
- [x] 1.6 Create `JobsModule` in `apps/backend/src/jobs/` that registers BullMQ with `REDIS_URL` and exports `email-notifications` and `webhook-delivery` queues

## 2. Database Migrations

- [x] 2.1 Add `isIdentityField Boolean @default(false)` to `FormField` model in Prisma schema
- [x] 2.2 Add `RegistrationStatus` enum (`CONFIRMED`, `CANCELLED`) to Prisma schema
- [x] 2.3 Add `IdentityType` enum (`EMAIL`) to Prisma schema
- [x] 2.4 Add `status RegistrationStatus @default(CONFIRMED)`, `identityValue String @default("")`, `identityType IdentityType?` to `Registration` model
- [x] 2.5 Add `@@unique([eventId, identityValue])` constraint to `Registration` model (scoped: skip rows where `identityValue` is empty string to avoid conflicts with legacy rows)
- [x] 2.6 Add `CLOSED` to `EventStatus` enum in Prisma schema
- [x] 2.7 Create `ApiKey` model: `id`, `organizationId`, `keyHash String @unique`, `keyPrefix String`, `name String`, `lastUsedAt DateTime?`, `revokedAt DateTime?`, `createdAt DateTime @default(now())`
- [x] 2.8 Create `WebhookEndpoint` model: `id`, `organizationId`, `url String`, `name String?`, `signingSecret String`, `lastFailedAt DateTime?`, `revokedAt DateTime?`, `createdAt DateTime`
- [x] 2.9 Run `prisma migrate dev` and verify all migrations apply cleanly
- [x] 2.10 Update `@eventflow/types` package with new enums: `RegistrationStatus`, `IdentityType`, `WebhookEventType` (`registration.created`, `registration.cancelled`, `event.published`, `event.closed`)

## 3. Registration Engine Updates

- [x] 3.1 In `RegistrationsService.register`: detect identity field from `formFields` where `isIdentityField = true`; if found, normalize email (`.trim().toLowerCase()`) and set `identityValue` / `identityType` on the new `Registration`
- [x] 3.2 In `RegistrationsService.register`: catch Prisma `P2002` unique constraint error and throw `409 Conflict` with message "This email address is already registered for this event"
- [x] 3.3 In `RegistrationsService.register`: validate that if an identity field exists, its `type` is `EMAIL`; otherwise reject with `400`
- [x] 3.4 Add `POST /api/registrations/:id/cancel` endpoint in `RegistrationsController`
- [x] 3.5 Implement `RegistrationsService.cancel(id)`: find registration, check it is `CONFIRMED`, set `status = CANCELLED`, save, then enqueue `registration.cancelled` webhook job
- [x] 3.6 Add cursor-based pagination to `GET /api/events/:eventId/registrations` — accept `cursor` and `limit` query params, return `{ data, nextCursor }`
- [x] 3.7 After successful registration creation, enqueue `registration.created` webhook job and `email-notifications` job (confirmation email)

## 4. Events Updates

- [x] 4.1 Add `CLOSED` as valid value in `EventStatus` enum and update validation/guards that check event status
- [x] 4.2 Reject `register` calls with `400` when event `status === CLOSED`
- [x] 4.3 Add `GET /api/events/:eventId/public` endpoint (public, no auth) returning event metadata + ordered form fields
- [x] 4.4 In `EventsService.update`: when `status` changes to `ACTIVE`, enqueue `event.published` webhook job
- [x] 4.5 In `EventsService.update`: when `status` changes to `CLOSED`, enqueue `event.closed` webhook job
- [x] 4.6 Add cursor-based pagination to `GET /api/events` (admin list endpoint)

## 5. Form Builder Updates

- [x] 5.1 Accept `isIdentityField` field in create/update form field DTOs
- [x] 5.2 In `EventsService`: enforce max one identity field per form — if `isIdentityField = true` and another field already has it set, throw `400`
- [x] 5.3 In `EventsService`: enforce identity field must have `type = EMAIL` — throw `400` if not

## 6. API Keys

- [x] 6.1 Create `ApiKeysModule` in `apps/backend/src/api-keys/`
- [x] 6.2 Implement `ApiKeysService.create(orgId, name)`: generate 32-byte random key, prefix with `ep_live_`, SHA-256 hash it, store hash + prefix, return raw key once
- [x] 6.3 Implement `ApiKeysService.list(orgId)`: return all non-revoked keys without hash or raw value
- [x] 6.4 Implement `ApiKeysService.revoke(id, orgId)`: set `revokedAt = now()`
- [x] 6.5 Implement `ApiKeysService.validateKey(rawKey)`: hash input, find matching record, check not revoked, fire-and-forget `lastUsedAt` update, return `organizationId`
- [x] 6.6 Add `POST /api/api-keys`, `GET /api/api-keys`, `DELETE /api/api-keys/:id` routes (JWT auth only — API keys can't create API keys)
- [x] 6.7 Create `ApiKeyAuthGuard` that checks `X-API-Key` header, calls `ApiKeysService.validateKey`, and sets `req.user.organizationId`
- [x] 6.8 Create composite `JwtOrApiKeyGuard` that tries JWT first, then API key, rejects if both fail
- [x] 6.9 Replace `AuthGuard('jwt')` with `JwtOrApiKeyGuard` on all protected endpoints that should be accessible via API key

## 7. Webhooks

- [x] 7.1 Create `WebhooksModule` in `apps/backend/src/webhooks/`
- [x] 7.2 Implement `WebhookEndpointsService.create(orgId, url, name)`: validate HTTPS-only URL, block private IP ranges, generate `crypto.randomBytes(32).toString('hex')` signing secret, store endpoint
- [x] 7.3 Implement `WebhookEndpointsService.list(orgId)` and `delete(id, orgId)` (soft-delete: set `revokedAt`)
- [x] 7.4 Add `POST /api/webhooks/endpoints`, `GET /api/webhooks/endpoints`, `DELETE /api/webhooks/endpoints/:id` routes (JWT or API key auth)
- [x] 7.5 Implement `WebhookDeliveryWorker` (BullMQ worker on `webhook-delivery` queue): build envelope, sign with HMAC-SHA256, POST to endpoint URL with 10s timeout, update `lastFailedAt` on exhaustion
- [x] 7.6 Implement `WebhooksService.emit(orgId, type, data)`: fetch all active org endpoints, enqueue one BullMQ job per endpoint with payload `{ id: wh_<uuid>, type, createdAt, data }` and retry config (4 retries, exponential backoff: 30s/5m/30m/2h)
- [x] 7.7 Configure BullMQ job options: `removeOnComplete: true`, `removeOnFail: { count: 100 }` (keep last 100 failed for debugging)

## 8. Email Notifications

- [x] 8.1 Create `EmailModule` in `apps/backend/src/email/` with Resend client initialized from `RESEND_API_KEY`
- [x] 8.2 Implement `EmailWorker` (BullMQ worker on `email-notifications` queue) that dispatches to the correct email handler by job type
- [x] 8.3 Create `RegistrationConfirmationEmail` React template in `@eventflow/react/emails/` (or inline HTML template) with event name, date, location, registration ID
- [x] 8.4 Implement confirmation email handler: send to `identityValue` (registrant email) with subject "You're registered for {event.title}"
- [x] 8.5 Implement organizer notification handler: fetch org owner email from DB, send summary of new registration
- [x] 8.6 Implement cancellation email handler: send cancellation confirmation to registrant's identity email

## 9. Widget: Event-Scoped Mode

- [x] 9.1 In `apps/widget/src/main.ts`: add attribute detection logic — if `event-id` attribute present, enter event-scoped mode; otherwise fall back to org-hub mode
- [x] 9.2 Implement event-scoped fetch: `GET /api/events/:eventId/public`, extract event + form fields
- [x] 9.3 Render registration form directly in event-scoped mode (no event list/selector step)
- [x] 9.4 Add `CLOSED` state rendering: if `event.status === 'CLOSED'`, show "Registration is closed" instead of form
- [x] 9.5 Add capacity-full state rendering in event-scoped mode (check `maxRegistrations` vs `registrationCount` if returned by public endpoint)
- [x] 9.6 Verify org-hub mode (`org` attribute) is unaffected by the new attribute detection logic

## 10. Dashboard UI

- [x] 10.1 Add "API Keys" section to dashboard: list keys (prefix + name + last used), create new key (show secret once in modal), revoke key
- [x] 10.2 Add "Webhooks" section to dashboard: list endpoints, add endpoint (URL + name), delete endpoint, show signing secret on creation
- [x] 10.3 Add `status` badge to registration rows in attendee table (`CONFIRMED` / `CANCELLED`)
- [x] 10.4 Add "Cancel Registration" action in registration detail view
- [x] 10.5 Add `isIdentityField` toggle to form field editor in the form builder UI
- [x] 10.6 Add `CLOSED` as selectable event status option in event settings

## 11. Verification

- [x] 11.1 Run full Prisma migration on a fresh DB and verify schema matches expectations
- [x] 11.2 Test concurrent duplicate registration rejection via two simultaneous requests (verify DB constraint fires)
- [x] 11.3 Test webhook delivery end-to-end using a local `ngrok` / `localhost.run` endpoint or a webhook.site URL
- [x] 11.4 Test API key creation, usage on a protected endpoint, and revocation
- [x] 11.5 Test event-scoped widget embed with a real `event-id` in a plain HTML page
- [x] 11.6 Test email delivery (confirmation, organizer notification, cancellation) with a Resend test API key
- [x] 11.7 Verify org-hub widget (`org` attribute) still works unchanged
- [x] 11.8 Verify `CLOSED` event rejects new registrations from both API and widget
