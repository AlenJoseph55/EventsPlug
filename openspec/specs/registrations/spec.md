## Purpose
Defines the specifications for validating, processing, rate-limiting, and recording attendee registrations for events.

## Requirements

### Requirement: Registration Submission & Validation
The system SHALL validate registration form answers dynamically against the event's defined custom form fields.

#### Scenario: Valid Submission
- **WHEN** an attendee submits answers matching all field constraints (types, options, required flags)
- **THEN** the registration is successfully saved in the database

#### Scenario: Missing Required Input
- **WHEN** a required field (excluding checkboxes) is omitted or empty
- **THEN** a bad request exception is thrown containing a validation error for that field

#### Scenario: Required Checkbox Unchecked
- **WHEN** a required checkbox field is not checked (value is not 'on', true, or 'true')
- **THEN** a bad request exception is thrown indicating the checkbox must be checked

#### Scenario: Invalid Email Format
- **WHEN** an email field is filled with a value that does not match standard email patterns
- **THEN** a validation error is returned indicating the email must be valid

#### Scenario: Invalid Select Option
- **WHEN** a dropdown select field contains a value not present in the field's allowed options array
- **THEN** a validation error is returned indicating the option is invalid

#### Scenario: Invalid Number Input
- **WHEN** a number field contains a non-numeric string
- **THEN** a validation error is returned indicating the value must be a valid number

### Requirement: Capacity Validation
The system SHALL prevent new registrations if the event's attendee capacity is fully booked.

#### Scenario: Registration Fails Due to Capacity Limit
- **WHEN** an attendee submits a registration but the event's registration count has reached or exceeded `maxRegistrations`
- **THEN** a bad request exception is thrown stating "This event is fully booked! Registration limits have been reached."

### Requirement: Rate Limiting
The system SHALL limit registration submission rate per client to protect the endpoint from spam or brute-force requests.

#### Scenario: Exceeding Submission Limit
- **WHEN** a user client sends more than 10 registration requests within a 60-second window
- **THEN** the request is throttled with a 429 Too Many Requests response

### Requirement: Registration Code Generation
The system SHALL assign a unique, human-readable registration code for every successful registration.

#### Scenario: Generate Registration ID
- **WHEN** a registration is successfully processed
- **THEN** the system generates an ID formatted as: `REG-[EVENT-SLUG-UPPERCASE]-[RANDOM-8-HEX]`

### Requirement: Unified Attendee Ticket Retrieval (B2C2B)
The system SHALL allow authenticated users to retrieve a consolidated list of their event registrations using their account email address, matching against dynamic JSON field values.

#### Scenario: Retrieve Personal Registrations
- **WHEN** an authenticated user requests their registered events
- **THEN** the system queries all registration records and returns those where any value in the custom answers JSON matches the user's account email address.

### Requirement: Dynamic Feed Priority (B2C2B)
The system SHALL dynamically order the dashboard feed based on user registration count.

#### Scenario: User has Active Tickets
- **WHEN** a user has one or more RSVP registrations
- **THEN** the ticket feed is displayed at the top of the portal dashboard.

#### Scenario: User has No Tickets
- **WHEN** a user has zero RSVP registrations
- **THEN** the hosted events control decks are prioritized at the top of the portal, and the empty tickets state is collapsed or omitted.


