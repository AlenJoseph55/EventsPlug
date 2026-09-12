## Why

Currently, registration processing in EventsPlug is a static one-time submission (`Registration`). There is no concept of attendee status tracking (Waitlisted, Registered, Checked-In, Cancelled), no auto-promotion when capacity frees up, and no quick check-in workflow for event organizers at venue entry points. Introducing an Attendee Lifecycle with automatic waitlist management and QR code check-in will streamline capacity usage and event entry operations.

## What Changes

- **Attendee Status Tracking**: Add explicit registration states (`REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED`) to track attendee progress.
- **Waitlist Logic & Automatic Promotion**: When an event reaches maximum capacity (`maxRegistrations`), new submissions are assigned `WAITLISTED` status. If a registered attendee cancels, the system automatically promotes the earliest waitlisted registration to `REGISTERED`.
- **Cancellation API & Self-Service**: Allow attendees and organizers to cancel registrations with automatic transactional waitlist promotion.
- **Dynamic QR Code Ticket Issuance**: Render dynamic QR code payloads representing ticket verification tokens for confirmed (`REGISTERED`) attendees in ticket views and emails.
- **Organizer QR Scanner Drawer**: Add a mobile-friendly camera scanner and manual check-in panel in the organizer dashboard RSVP drawer to scan tickets and update status to `CHECKED_IN` in real time.

## Capabilities

### New Capabilities
- `attendee-lifecycle`: State machine for registrations, automatic waitlist enqueue/promotion on cancellation, and organizer ticket check-in workflows.

### Modified Capabilities
- `registrations`: Expand registration processing to handle waitlist fallback when `maxRegistrations` capacity is hit, and dynamic registration status retrieval.

## Impact

- **Database**: Add `RegistrationStatus` enum and state timestamps (`checkedInAt`, `cancelledAt`, `promotedAt`) to `Registration` model in `apps/backend/prisma/schema.prisma`.
- **Backend API**:
  - Update `RegistrationsService.register` to handle waitlisting.
  - New endpoint `POST /api/registrations/:id/cancel` for cancellation and atomic transaction promotion.
  - New endpoint `POST /api/events/:eventId/check-in` for ticket verification and status update.
- **Frontend Dashboard**:
  - Enhance `/portal` RSVP drawer to display status badges, waitlist order, and cancellation actions.
  - Integrate camera-based QR code scanner component using `@zxing/browser` or `html5-qrcode` in the dashboard.
- **Attendee Ticket View**:
  - Display attendee status (`WAITLISTED` vs `REGISTERED`) and render ticket QR code via `qrcode` library.
