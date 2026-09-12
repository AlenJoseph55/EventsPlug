# Registrations Delta Specification

## ADDED Requirements

### Requirement: Payment Status Tracking
The system SHALL track payment statuses (`FREE`, `PENDING_PAYMENT`, `PAID`, `FAILED`) and transaction reference data for event registrations.

#### Scenario: Free Event Submission
- **WHEN** a user registers for an event with price 0
- **THEN** the registration status is immediately set to `FREE`

#### Scenario: Paid Event Submission Initial State
- **WHEN** a user submits a paid registration form
- **THEN** the registration status is initially set to `PENDING_PAYMENT` until gateway authorization or manual approval succeeds
