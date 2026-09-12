## ADDED Requirements

### Requirement: Registration Identity Field
A form SHALL support exactly one field marked as the identity field (`isIdentityField: true`). In V1, the identity field MUST have `type = EMAIL`. The identity field is used for duplicate prevention and confirmation email delivery.

#### Scenario: Identity field validated on creation
- **WHEN** an organizer marks a field as `isIdentityField: true` and its type is not `EMAIL`
- **THEN** the request is rejected with `400 Bad Request`

#### Scenario: Only one identity field allowed
- **WHEN** an organizer attempts to set `isIdentityField: true` on a second field in the same form
- **THEN** the request is rejected with `400 Bad Request` stating only one identity field is permitted

### Requirement: Registration Duplicate Prevention
The system SHALL prevent duplicate registrations using a DB-level unique constraint on `(eventId, normalizedIdentityValue)`. Normalization is `.trim().toLowerCase()`. No provider-specific transformations are applied.

#### Scenario: Duplicate registration rejected
- **WHEN** a registration is submitted for an event where the identity field value (normalized) already exists in a `CONFIRMED` registration
- **THEN** the system returns `409 Conflict` with a message indicating the identity is already registered

#### Scenario: Race condition safety
- **WHEN** two concurrent requests attempt to register the same identity for the same event simultaneously
- **THEN** the database unique constraint ensures exactly one succeeds and the other receives a `409 Conflict` mapped from Prisma error `P2002`

#### Scenario: No identity field — no duplicate check
- **WHEN** an event form has no field marked as `isIdentityField`
- **THEN** duplicate prevention is not enforced and multiple submissions are allowed

### Requirement: Registration Status
Every registration SHALL carry a `status` field. V1 statuses are `CONFIRMED` and `CANCELLED`.

#### Scenario: New registration is CONFIRMED
- **WHEN** a registration is successfully created
- **THEN** its `status` is set to `CONFIRMED`

### Requirement: Registration Cancellation
The system SHALL allow a registrant to cancel their registration via a public endpoint authenticated by registration ID.

#### Scenario: Successful cancellation
- **WHEN** `POST /api/registrations/:id/cancel` is called with a valid registration ID
- **THEN** the registration's `status` is updated to `CANCELLED` and a `registration.cancelled` webhook event is enqueued

#### Scenario: Already cancelled
- **WHEN** cancellation is requested for a registration that is already `CANCELLED`
- **THEN** the request is rejected with `409 Conflict`

### Requirement: API Pagination on Registration Lists
The registration list endpoint SHALL support cursor-based pagination. Default page size is 50; maximum is 100.

#### Scenario: Paginated response
- **WHEN** `GET /api/events/:eventId/registrations` is called with optional `cursor` and `limit` query parameters
- **THEN** the response contains `{ data: Registration[], nextCursor: string | null }` where `nextCursor` is null when no more results exist

## MODIFIED Requirements

### Requirement: Rate Limiting
The system SHALL limit registration submission rate per client to protect the endpoint from spam or brute-force requests. When Redis is available, the throttler store SHALL use Redis to maintain rate limit state across process restarts and multiple instances.

#### Scenario: Exceeding Submission Limit
- **WHEN** a user client sends more than 10 registration requests within a 60-second window
- **THEN** the request is throttled with a 429 Too Many Requests response

#### Scenario: Redis-backed throttler state
- **WHEN** the application is restarted or running as multiple instances
- **THEN** rate limit counters persist in Redis and are shared across instances
