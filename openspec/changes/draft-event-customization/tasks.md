## 1. Database & Schema Migrations

- [x] 1.1 Add DRAFT status to EventStatus enum in schema.prisma and execute prisma db push
- [x] 1.2 Regenerate Prisma client in backend and dashboard apps

## 2. Backend Controllers & Services

- [x] 2.1 Update Event Creation Service to set status to DRAFT by default
- [x] 2.2 Add publishEvent status transition controller (PATCH /api/events/:id/publish) (Satisfied by standard update status payload)
- [x] 2.3 Update public event registration query controller to reject queries on draft events

## 3. Frontend Wizard Layout & Custom Fields

- [x] 3.1 Update CreateEventTab Step 1 submission to create draft event and load Step 2
- [x] 3.2 Refactor Step 2 to embed EditEventModal form customization layout
- [x] 3.3 Add Publish transition callback to Step 3 layout to activate draft events

## 4. Portal Views & Verification

- [x] 4.1 Update PortalDashboard event listings to display draft badges
- [x] 4.2 Validate that draft events cannot be registered by attendees
