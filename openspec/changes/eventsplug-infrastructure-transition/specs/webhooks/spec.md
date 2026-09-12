## ADDED Requirements

### Requirement: Webhook Endpoint Registration
An organizer SHALL be able to register one or more HTTPS webhook endpoint URLs for their organization. Each endpoint SHALL have a unique signing secret generated at creation.

#### Scenario: Register a webhook endpoint
- **WHEN** an organizer sends `POST /api/webhooks/endpoints` with a valid HTTPS `url` and optional `name`
- **THEN** the system creates a `WebhookEndpoint` record, generates a unique signing secret, and returns the signing secret in the response exactly once

#### Scenario: Non-HTTPS URL rejected
- **WHEN** an organizer submits an endpoint URL with a non-HTTPS scheme (e.g., `http://`)
- **THEN** the request is rejected with `400 Bad Request`

#### Scenario: Private IP address rejected
- **WHEN** an organizer submits an HTTPS URL that resolves to a private or loopback IP address
- **THEN** the request is rejected with `400 Bad Request` (SSRF protection)

### Requirement: Webhook Event Delivery
The system SHALL deliver webhook events to all active org endpoints asynchronously via BullMQ. Delivery SHALL be attempted with exponential backoff on failure.

#### Scenario: Successful delivery
- **WHEN** a webhook-triggering action occurs (e.g., `registration.created`)
- **THEN** a BullMQ job is enqueued in the `webhook-delivery` queue for each active endpoint of the owning organization
- **AND** the job worker POSTs the payload to the endpoint URL within 30 seconds

#### Scenario: Delivery failure triggers retry
- **WHEN** the endpoint URL returns a non-2xx response or times out (10s timeout)
- **THEN** BullMQ retries the job with exponential backoff (delays: 30s, 5m, 30m, 2h) up to 4 retries

#### Scenario: Delivery exhausted after retries
- **WHEN** all retry attempts are exhausted
- **THEN** the job moves to the BullMQ dead-letter queue and the endpoint's `lastFailedAt` is updated

### Requirement: Signed Webhook Payloads
Every webhook delivery SHALL include a consistent envelope and HMAC-SHA256 signature header so receivers can verify authenticity and deduplicate deliveries.

#### Scenario: Consistent envelope shape
- **WHEN** any webhook event is delivered
- **THEN** the HTTP body conforms to: `{ "id": "wh_<uuid>", "type": "<event-type>", "createdAt": "<ISO8601>", "data": { ... } }`

#### Scenario: Signature header present
- **WHEN** any webhook event is delivered
- **THEN** the request includes headers: `X-EventsPlug-Event: <type>`, `X-EventsPlug-Delivery: <wh_id>`, `X-EventsPlug-Signature: sha256=<hmac>`

#### Scenario: Signature verification by receiver
- **WHEN** a receiver computes `HMAC-SHA256(signingSecret, rawBody)` and compares it to the value in `X-EventsPlug-Signature` after the `sha256=` prefix
- **THEN** the comparison succeeds if the payload was not tampered with

### Requirement: V1 Webhook Event Catalog
The system SHALL emit the following four event types and no others in V1:

| Event type | Trigger |
|---|---|
| `registration.created` | A new registration is confirmed |
| `registration.cancelled` | A registration is cancelled |
| `event.published` | An event's status changes to `ACTIVE` |
| `event.closed` | An event's status changes to `CLOSED` |

#### Scenario: registration.created payload
- **WHEN** a registration is successfully created
- **THEN** the `data` object contains `{ "event": { "id": "..." }, "registration": { "id": "...", "status": "confirmed", "createdAt": "..." } }`

#### Scenario: event.published payload
- **WHEN** an event is published
- **THEN** the `data` object contains `{ "event": { "id": "...", "title": "...", "slug": "..." } }`
