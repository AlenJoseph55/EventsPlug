## Purpose
Defines the specifications for the embeddable `<event-widget>` custom HTML element, its responsive layouts (Grid, List, Carousel), dynamic form builder modal, client-side input validations, and registration confirmation.

## Requirements

### Requirement: Layout & Property Cascades
The widget SHALL render events of the organization specified by the `org` attribute, applying the chosen `layout` (GRID, LIST, CAROUSEL) and conforming to the `limit` parameter.

#### Scenario: Render Widget on Page Mount
- **WHEN** the `<event-widget>` element is mounted in the host DOM with a valid `org` attribute
- **THEN** it fetches events from the backend and renders them using layout-specific styling classes

#### Scenario: Apply Layout Attribute Overrides
- **WHEN** the `layout` attribute is set to "LIST" or "CAROUSEL"
- **THEN** the widget immediately updates its CSS structure to render in list columns or scrollable horizontal rows

#### Scenario: Display Event Capacity Indicator
- **WHEN** an event defines a capacity limit (`maxRegistrations`)
- **THEN** the widget displays a progress bar indicating filled seats vs total capacity

### Requirement: Dynamic Registration Modal & Form Builder
The widget SHALL render a dialog modal for registration, displaying inputs dynamically based on the event's custom form fields, and performing client-side validation before submission.

#### Scenario: Open Registration Modal
- **WHEN** an attendee clicks the register button on an event card
- **THEN** a modal overlay opens and injects dynamic form fields matching the event's field definitions

#### Scenario: Validate Form Inputs Inline
- **WHEN** the attendee clicks submit and fields do not satisfy validation (e.g. empty required input, invalid email, or unchecked required terms checkbox)
- **THEN** the widget prevents submission and displays inline error messages beneath the offending fields

#### Scenario: Process Registration Submission
- **WHEN** the form passes all client-side checks and is submitted
- **THEN** it shows a loading indicator and posts the registration details to the API

#### Scenario: Render Success Confirmation
- **WHEN** the API returns a successful registration response
- **THEN** the form is replaced by a success checkmark and confirmation message containing the attendee's registration code
