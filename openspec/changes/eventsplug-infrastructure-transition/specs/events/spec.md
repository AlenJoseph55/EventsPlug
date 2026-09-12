## ADDED Requirements

### Requirement: CLOSED Event Status
The `EventStatus` enum SHALL include a `CLOSED` value. An organizer SHALL be able to set an event's status to `CLOSED` explicitly, in addition to the existing `ACTIVE`, `INACTIVE`, and `DRAFT` values. A `CLOSED` event SHALL reject new registration attempts.

#### Scenario: Registration rejected for CLOSED event
- **WHEN** a registration is submitted for an event with status `CLOSED`
- **THEN** the request is rejected with `400 Bad Request` stating the event is closed

#### Scenario: event.closed webhook emitted
- **WHEN** an event's status is updated to `CLOSED`
- **THEN** an `event.closed` webhook event is enqueued for all active org webhook endpoints

### Requirement: Event-Scoped Public Endpoint
The system SHALL expose a public endpoint `GET /api/events/:eventId/public` that returns event metadata and form fields for a single event, identified by its UUID. This endpoint is used by the event-scoped widget embed.

#### Scenario: Fetch event by ID
- **WHEN** `GET /api/events/:eventId/public` is called with a valid event ID
- **THEN** the response contains event `id`, `title`, `description`, `date`, `location`, `status`, `maxRegistrations`, `registrationDeadline`, `accentColor`, and the ordered `formFields` array

#### Scenario: Event not found
- **WHEN** the event ID does not exist
- **THEN** the response is `404 Not Found`

### Requirement: Webhook Emission on Publish
The system SHALL emit an `event.published` webhook event when an event's status transitions to `ACTIVE`.

#### Scenario: event.published webhook emitted
- **WHEN** an organizer updates an event's status to `ACTIVE`
- **THEN** an `event.published` webhook event is enqueued for all active org webhook endpoints

### Requirement: API Pagination on Event Lists
The protected admin event list endpoint SHALL support cursor-based pagination. Default page size is 50; maximum is 100.

#### Scenario: Paginated response
- **WHEN** `GET /api/events` is called with optional `cursor` and `limit` query parameters
- **THEN** the response contains `{ data: Event[], nextCursor: string | null }`
