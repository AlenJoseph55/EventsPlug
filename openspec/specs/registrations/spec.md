## Purpose
Defines the specifications for validating, processing, rate-limiting, recording form submissions, and exporting responses as CSV.

## Requirements

### Requirement: Registration Submission & Validation
The system SHALL validate form submissions dynamically against the event's defined custom form fields.

#### Scenario: Valid Submission
- **WHEN** a user submits answers matching all field constraints (types, options, required flags)
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
The system SHALL prevent new form submissions if the event's registration limit is reached.

#### Scenario: Registration Fails Due to Capacity Limit
- **WHEN** a user submits a form but the event's registration count has reached or exceeded `maxRegistrations`
- **THEN** a bad request exception is thrown stating "This event is fully booked! Registration limits have been reached."

### Requirement: Rate Limiting
The system SHALL limit registration submission rate per client to protect the endpoint from spam or brute-force requests.

#### Scenario: Exceeding Submission Limit
- **WHEN** a user client sends more than 10 registration requests within a 60-second window
- **THEN** the request is throttled with a 429 Too Many Requests response

### Requirement: Form Submissions Data Export
The system SHALL support 1-click CSV download of all form submission answers for an event.

#### Scenario: Export CSV
- **WHEN** an organizer requests the CSV export endpoint for an event
- **THEN** the server generates a formatted CSV spreadsheet containing field labels as column headers and registration answers as rows


