## ADDED Requirements

### Requirement: API Key Authentication Guard
The system SHALL provide a composite authentication guard that accepts either a JWT Bearer token or an `X-API-Key` header. Both paths SHALL resolve to an `organizationId` available as `req.user.organizationId` for downstream services.

#### Scenario: JWT authentication path unchanged
- **WHEN** a request includes a valid JWT Bearer token and no `X-API-Key` header
- **THEN** authentication proceeds via the existing JWT strategy; behavior is identical to the current implementation

#### Scenario: API key authentication path
- **WHEN** a request includes a valid, non-revoked API key in `X-API-Key` and no JWT token
- **THEN** the system resolves the owning organization and sets `req.user = { organizationId: key.organizationId }` before the request proceeds

#### Scenario: Both headers present — JWT takes precedence
- **WHEN** a request includes both a JWT token and `X-API-Key`
- **THEN** the JWT token is used for authentication and the API key is ignored

#### Scenario: Neither header present
- **WHEN** a protected endpoint receives a request with no JWT and no `X-API-Key`
- **THEN** the request is rejected with `401 Unauthorized`
