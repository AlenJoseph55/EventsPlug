## Why

The Custom Registration Form Builder currently requires an event to be created first before its fields can be customized. This prevents organizers from custom tailoring form inputs during the initial event creation wizard, forcing them to use preset defaults first and then navigate back to edit.

## What Changes

- **Draft State Support**: Add a `DRAFT` status to the `EventStatus` enum in database schema, enabling creation of incomplete draft event objects.
- **Embedded Form Builder in Wizard**: Refactor the Event Creation Wizard's Step 2 to embed the full custom field builder. Organizers can customize, add, delete, and reorder fields directly during creation.
- **Transactional Publishing**: Add a final "Publish" step that transitions the event status from `DRAFT` to `ACTIVE`.
- **Portal Visibility**: Update the dashboard portal event list to display draft events with an actionable "Resume Setup" option and allow organizers to clean them up.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `events`: Modify event creation logic to write events as `DRAFT` status first, allow customization of form fields on draft records, and transition them to `ACTIVE` upon publish. Reject public attendee registration lookups on events that are in `DRAFT` status.

## Impact

- **Database**: `schema.prisma` EventStatus updates.
- **Backend API**: `POST /api/events` defaults to `DRAFT` status. Public endpoints (event registration page queries) must exclude draft events.
- **Frontend Dashboard**: `CreateEventTab.tsx` wizard step transitions and components integrations; `PortalDashboard` event table status views.
