## ADDED Requirements

### Requirement: Registration Status State Machine
The system SHALL track status transitions for every registration using statuses: `REGISTERED`, `WAITLISTED`, `CHECKED_IN`, and `CANCELLED`.

#### Scenario: Submitting registration within capacity limit
- **WHEN** an attendee submits a registration and current active registrations count is less than `maxRegistrations`
- **THEN** the registration status is set to `REGISTERED`.

#### Scenario: Submitting registration when max capacity is reached
- **WHEN** an attendee submits a registration and current active registrations count equals or exceeds `maxRegistrations`
- **THEN** the registration status is set to `WAITLISTED`.

### Requirement: Registration Cancellation & Automatic Waitlist Promotion
The system SHALL support registration cancellation and automatically promote the oldest waitlisted attendee to `REGISTERED`.

#### Scenario: Registration cancellation with waitlist queue
- **WHEN** an attendee or organizer cancels a `REGISTERED` registration and at least one `WAITLISTED` registration exists
- **THEN** the target registration status changes to `CANCELLED` and the oldest `WAITLISTED` registration status automatically changes to `REGISTERED`.

### Requirement: Organizer QR Check-in Verification
The system SHALL verify valid ticket codes or QR code payloads and update attendee status to `CHECKED_IN`.

#### Scenario: Scanning a valid registered ticket QR code
- **WHEN** an organizer scans a QR code or submits a valid ticket ID for a `REGISTERED` attendee
- **THEN** the attendee status transitions to `CHECKED_IN` and the `checkedInAt` timestamp is recorded.

#### Scenario: Scanning an already checked-in ticket
- **WHEN** an organizer scans a ticket code whose status is already `CHECKED_IN`
- **THEN** the system returns a conflict warning indicating the ticket was previously checked in.
