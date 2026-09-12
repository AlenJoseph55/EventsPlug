## 1. Database Schema & Prisma Migration

- [x] 1.1 Add `RegistrationStatus` enum (`REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED`) to `apps/backend/prisma/schema.prisma`.
- [x] 1.2 Add `status`, `checkedInAt`, `cancelledAt`, and `promotedAt` fields to `Registration` model in `schema.prisma`.
- [x] 1.3 Generate and run Prisma migration (`npx prisma migrate dev`).

## 2. Backend Service & API Logic

- [x] 2.1 Update `RegistrationsService.register` to calculate active capacity and assign `WAITLISTED` status when capacity is full.
- [x] 2.2 Implement atomic transaction cancellation logic in `RegistrationsService.cancelRegistration` with automatic promotion of oldest `WAITLISTED` registration.
- [x] 2.3 Add endpoint `POST /api/registrations/:id/cancel` in `RegistrationsController`.
- [x] 2.4 Add endpoint `POST /api/events/:eventId/check-in` in `EventsController` to verify ticket payload and transition status to `CHECKED_IN`.

## 3. Frontend Attendee Ticket View & Dynamic QR Code

- [x] 3.1 Update attendee ticket card component to render QR code containing ticket verification data using `qrcode`.
- [x] 3.2 Add status badge (`REGISTERED`, `WAITLISTED` with position #, `CHECKED_IN`, `CANCELLED`) to public ticket feed.
- [x] 3.3 Implement attendee self-service cancellation button with confirmation dialog.

## 4. Organizer QR Check-in Drawer & Dashboard Integration

- [x] 4.1 Update `/portal` RSVP drawer tab to include a camera-based QR code scanner powered by `html5-qrcode` or `@zxing/browser`.
- [x] 4.2 Add manual search fallback input to quickly lookup and check in attendees by name/email/ID.
- [x] 4.3 Add audio/visual feedback indicators for check-in results (`SUCCESS`, `ALREADY_CHECKED_IN`, `INVALID_OR_WAITLISTED`).

## 5. Verification & Testing

- [x] 5.1 Test capacity overflow scenario to verify registrations switch to `WAITLISTED`.
- [x] 5.2 Test ticket cancellation to confirm the oldest waitlisted attendee is automatically promoted.
- [x] 5.3 Verify QR code generation and live check-in scanner workflow in organizer dashboard.
