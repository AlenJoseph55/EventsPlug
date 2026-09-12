## Context

EventsPlug currently records registrations as static documents in PostgreSQL. There is no status workflow for registrations, which limits capacity management to hard blocking and provides no entry desk check-in tools for organizers.

## Goals / Non-Goals

**Goals:**
- Implement a status-based registration workflow: `REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED`.
- Automatically enqueue submissions as `WAITLISTED` when capacity is full.
- Automatically promote the oldest waitlisted attendee in an atomic Prisma database transaction when a registration is cancelled.
- Render dynamic QR code payloads for confirmed tickets.
- Build a mobile-friendly camera scanner and manual check-in drawer in the organizer dashboard.

**Non-Goals:**
- Paid ticketing / payment gateway integration.
- Custom multi-tier ticket classes (e.g. VIP vs General Admission).

## Decisions

### 1. Database Model & Status Lifecycle
- **Decision**: Add `RegistrationStatus` enum to `Registration` model with timestamps (`checkedInAt`, `cancelledAt`, `promotedAt`).
- **Rationale**: Storing timestamps on state transitions enables auditing and queue order tracking without adding secondary event tables.

### 2. Transactional Cancellation & Waitlist Promotion
- **Decision**: Implement `cancelRegistration` using `prisma.$transaction`.
- **Rationale**: Wrapping cancellation and promotion in a single transaction guarantees zero race conditions when multiple cancellations occur simultaneously.

### 3. QR Code Payload & Security
- **Decision**: Encode `id` (`REG-XXXX-YYYY`) alongside an HMAC signature (`sha256(id + JWT_SECRET)`) into the QR payload.
- **Rationale**: Signing the ticket prevents attendees from falsifying check-in QR codes manually.

### 4. Frontend QR Scanning Integration
- **Decision**: Integrate `html5-qrcode` or `@zxing/browser` in the dashboard RSVP modal drawer.
- **Rationale**: Provides instant, zero-dependency camera access in web browsers for organizers without needing specialized hardware scanners.

## Risks / Trade-offs

- **[Risk]** Camera permission denied on organizer mobile browsers → **Mitigation**: Provide a prominent fallback manual text search input in the check-in drawer.
- **[Risk]** Rapid cancellation spam promoting waitlists uncontrollably → **Mitigation**: Rate limit check-in and cancellation endpoints.
