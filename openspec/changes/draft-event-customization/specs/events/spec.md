## MODIFIED Requirements

### Requirement: Event Management
Organizers SHALL be able to create, view, update, and delete event listings for their organization.

#### Scenario: Create a New Event
- **WHEN** an organizer creates a new event with a title, slug, date, location, description, and optional registration capacity limit
- **THEN** the event is successfully saved in the database with a status of DRAFT by default

#### Scenario: Update Event Details
- **WHEN** an organizer updates properties of an existing event
- **THEN** the changes are saved and reflected immediately in public and admin lists

#### Scenario: Delete an Event
- **WHEN** an organizer deletes an event
- **THEN** the event and all associated registrations and custom form fields are removed from the database

#### Scenario: Publish a Draft Event
- **WHEN** an organizer publishes a draft event
- **THEN** the event status changes from DRAFT to ACTIVE and it becomes accessible for attendee registration
