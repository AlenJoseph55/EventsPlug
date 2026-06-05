## MODIFIED Requirements

### Requirement: Form Field Reordering
Organizers SHALL be able to reorder the fields in a form dynamically using a drag-and-drop model or keyboard shortcuts.

#### Scenario: Transactional Bulk Reordering
- **WHEN** an organizer submits a list of custom fields with new order indices
- **THEN** the system updates the order of all specified fields in a single database transaction

#### Scenario: Drag and Drop Reordering
- **WHEN** an organizer drags a form field to a new position in the active fields list and releases it
- **THEN** the local field list reorders visually and dispatches a bulk update to the database transaction
