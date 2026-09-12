## Purpose
Defines the specifications for the embeddable `<events-plug-widget>` custom HTML element, its Shadow DOM styling protection, dynamic form builder rendering, client-side input validations, and response confirmation.

## Requirements

### Requirement: Embedded Custom HTML Element
The widget SHALL render as a custom Web Component (`<events-plug-widget>` / `<event-widget>`) identified by an `event-id` or `event-slug` attribute.

#### Scenario: Render Widget in Host DOM
- **WHEN** the `<events-plug-widget>` element is mounted in a host webpage
- **THEN** it initializes a Shadow DOM tree, preventing host CSS rule leakage or styling collisions

#### Scenario: Fetch Event Form Fields
- **WHEN** the widget mounts with a valid `event-id` or `event-slug`
- **THEN** it fetches the event title, description, and custom form field definitions from the backend

### Requirement: Dynamic Form Rendering & Submission
The widget SHALL render dynamic input fields matching the event's form field definitions and perform client-side validation prior to submission.

#### Scenario: Validate Form Inputs Inline
- **WHEN** the user submits the form and inputs do not satisfy field constraints
- **THEN** the widget prevents network dispatch and displays inline validation warnings

#### Scenario: Submit Form Responses
- **WHEN** all client-side checks pass and the user submits
- **THEN** it displays a clean loading state and posts the response payload to `/api/registrations`

#### Scenario: Render Confirmation State
- **WHEN** the submission succeeds
- **THEN** the form elements transition into a success checkmark and confirmation note
