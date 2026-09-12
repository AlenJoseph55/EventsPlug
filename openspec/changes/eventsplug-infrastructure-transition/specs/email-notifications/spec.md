## ADDED Requirements

### Requirement: Registration Confirmation Email
The system SHALL send a transactional confirmation email to the registrant upon successful registration. Delivery SHALL be asynchronous via the `email-notifications` BullMQ queue.

#### Scenario: Email enqueued on registration
- **WHEN** a registration is successfully created and the identity field contains a valid email
- **THEN** a job is enqueued in the `email-notifications` queue containing the registration ID, event ID, and registrant email

#### Scenario: Email delivered via Resend
- **WHEN** the email worker processes the job
- **THEN** it calls `Resend.emails.send()` with `from: RESEND_FROM_EMAIL`, the registrant's email address, and a rendered HTML email confirming their registration for the event

#### Scenario: Email delivery failure does not fail registration
- **WHEN** Resend returns an error
- **THEN** the HTTP registration response is unaffected; the BullMQ job is retried independently

### Requirement: Organizer New Registration Notification
The system SHALL notify the organizer (org owner email) when a new registration is received.

#### Scenario: Organizer notified on new registration
- **WHEN** a registration is created
- **THEN** a notification email is enqueued and sent to the organization's owner email summarizing the new registration

### Requirement: Cancellation Confirmation Email
The system SHALL send a cancellation confirmation email to the registrant when their registration is cancelled.

#### Scenario: Cancellation email sent
- **WHEN** a registration transitions to `CANCELLED` status
- **THEN** a cancellation confirmation email is enqueued and delivered to the registrant's identity email address
