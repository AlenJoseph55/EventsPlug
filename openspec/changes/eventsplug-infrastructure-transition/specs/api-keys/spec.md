## ADDED Requirements

### Requirement: API Key Creation
An organizer SHALL be able to create a named org-scoped API key. The system SHALL return the raw key exactly once at creation time and SHALL NOT store it in plaintext.

#### Scenario: Successful API key creation
- **WHEN** an authenticated organizer sends a `POST /api/api-keys` request with a `name` field
- **THEN** the system generates a cryptographically random key with prefix `ep_live_`, stores its SHA-256 hash and the prefix in the database, and returns the full raw key in the response body exactly once

#### Scenario: Key not re-displayable after creation
- **WHEN** an organizer lists their API keys via `GET /api/api-keys`
- **THEN** the response includes `id`, `name`, `keyPrefix`, `lastUsedAt`, `createdAt`, and `revokedAt` — but never the raw key or its hash

### Requirement: API Key Revocation
An organizer SHALL be able to revoke an API key. Revoked keys SHALL be rejected immediately on subsequent requests.

#### Scenario: Revoke an active key
- **WHEN** an organizer sends `DELETE /api/api-keys/:id`
- **THEN** the key's `revokedAt` is set to the current timestamp

#### Scenario: Revoked key rejected
- **WHEN** an inbound request presents a key whose `revokedAt` is not null
- **THEN** the request is rejected with `401 Unauthorized`

### Requirement: API Key Authentication
The system SHALL accept `X-API-Key` header as an alternate authentication method on all protected endpoints. A valid API key SHALL resolve to the owning organization's ID, equivalent to JWT authentication.

#### Scenario: Valid API key grants access
- **WHEN** a request presents a valid, non-revoked API key in the `X-API-Key` header
- **THEN** the system sets `req.user.organizationId` to the key's owning organization and the request proceeds

#### Scenario: Invalid API key rejected
- **WHEN** a request presents a key that does not match any stored hash
- **THEN** the request is rejected with `401 Unauthorized`

#### Scenario: Last-used timestamp updated
- **WHEN** a request is successfully authenticated via API key
- **THEN** the key's `lastUsedAt` field is updated to the current timestamp (fire-and-forget, non-blocking)
