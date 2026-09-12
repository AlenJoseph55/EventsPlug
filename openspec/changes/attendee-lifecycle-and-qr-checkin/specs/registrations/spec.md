## MODIFIED Requirements

### Requirement: Capacity Validation
The system SHALL prevent new registrations from exceeding active capacity limits and enqueue overflow registrations as waitlisted.

#### Scenario: Registration Enqueued as Waitlisted Due to Capacity Limit
- **WHEN** an attendee submits a registration but the event's active registration count (`REGISTERED` or `CHECKED_IN`) has reached or exceeded `maxRegistrations`
- **THEN** the submission succeeds with status `WAITLISTED` and notifies the attendee that they are on the waitlist.
