## Context

During event creation, organizers are forced to select a preset template and cannot modify individual fields because the event record has not yet been saved in the database. Adding a draft event status allows the creation wizard to save basic details immediately, transitioning into a full form-building experience backed by the database before publishing.

## Goals / Non-Goals

**Goals:**
- Add `DRAFT` to the `EventStatus` enum in Prisma database schema.
- Update `CreateEventTab.tsx` wizard to immediately create a `DRAFT` status event in Step 1.
- Embed the Custom Form Builder in Step 2 of the wizard.
- Lock draft events from being accessed by public attendee registration endpoints.
- Allow organizers to view, resume setup, or delete draft events from the portal list.

**Non-Goals:**
- Creating temporary in-memory layouts on the client side (we are committing draft event records directly to the database).
- Automating cron-based cleanup of old drafts (they will be visible to the user who can manage/delete them manually).

## Decisions

### 1. Database Schema Extension
- **Decision**: Add `DRAFT` to the `EventStatus` enum in `prisma/schema.prisma` and run migration. Set default value of `Event.status` to `ACTIVE` (for backwards compatibility) but override it to `DRAFT` in the `createEvent` controller.
- **Alternatives considered**: Storing staged fields in local client storage (rejected because if the user switches computers or reloads, their creation context is lost).

### 2. Frontend Wizard Component Integration
- **Decision**: Reuse the existing `EditEventModal` form customization interface (specifically the drag-and-drop lists, accordion property editors, and hooks) directly inside `CreateEventTab.tsx` Step 2.
- **Alternatives considered**: Creating a simplified, custom field editor for the wizard (rejected to avoid code duplication).

### 3. Draft Visibility Constraints
- **Decision**: Update backend validation inside `events.controller` / `events.service` public lookup endpoints to throw a `NotFound` exception if an attendee queries an event slug whose status is `DRAFT`.
- **Alternatives considered**: Allowing registration on draft events (rejected because draft events do not have finalized ticket metadata or form fields).

## Risks / Trade-offs

- **[Risk]** User exits creation wizard in Step 2, leaving an incomplete draft event record.
  - **Mitigation** → Display draft events in the portal dashboard with a "Draft" status badge and a prominent "Resume Setup" / "Delete" link.
