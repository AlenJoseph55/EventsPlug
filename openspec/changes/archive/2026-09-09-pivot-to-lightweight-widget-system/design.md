# Design: Ultra-Lightweight Embeddable Form Engine

## Overview

This design outlines the architecture for stripping out ticket inventory management, attendee check-in lifecycles, and heavy theme canvas backdrops, replacing them with a minimal, high-efficiency form builder and embeddable widget engine.

---

## 1. Simplified Core Data Schema

```prisma
// Minimal Prisma Schema Target

model Organization {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  logoUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  events    Event[]
  users     User[]
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  passwordHash   String
  role           UserRole     @default(ORGANIZER)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
}

model Event {
  id                   String         @id @default(uuid())
  organizationId       String
  organization         Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title                String
  slug                 String
  description          String
  date                 DateTime?
  location             String?
  bannerUrl            String?
  accentColor          String         @default("#3b82f6") // Clean accent hex
  registrationTitle    String?        @default("Register")
  registrationDescription String?     @default("Complete the form below.")
  buttonLabel          String?        @default("Submit")
  formFields           FormField[]
  responses            Registration[]
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  @@unique([organizationId, slug])
}

model FormField {
  id          String    @id @default(uuid())
  eventId     String
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  type        FieldType // TEXT, EMAIL, TEXTAREA, SELECT, CHECKBOX, NUMBER
  label       String
  placeholder String?
  required    Boolean   @default(false)
  options     Json?     @default("[]") // string[]
  order       Int       @default(0)
}

model Registration {
  id          String   @id @default(uuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  answers     Json     // key-value pairs matching FormField IDs
  submittedAt DateTime @default(now())
}
```

---

## 2. Widget Architecture & Embed Options

### Embed Modes

1. **Inline Card Embed (`<events-plug>`):**
   ```html
   <script src="https://cdn.eventsplug.com/widget.js" async></script>
   <events-plug event="tech-meetup-2026"></events-plug>
   ```

2. **Modal Overlay (`data-events-plug-modal`):**
   ```html
   <button data-events-plug-modal="tech-meetup-2026">Open Registration</button>
   ```

3. **Standalone Fallback Page (`/w/[eventSlug]`):**
   A clean, responsive Next.js route hosting the exact same lightweight widget layout for direct sharing via social media or email.

---

## 3. CSV Export Architecture

In `apps/dashboard`:
- Fetch form fields for the target event to construct dynamic table headers.
- Query `Registration` responses for the event.
- Generate sanitized CSV strings client-side or via a lightweight streaming endpoint `GET /api/v1/events/:id/responses/export-csv`.
- Download directly without third-party dependencies.

---

## 4. UI/UX Refactoring in Dashboard

* **Sidebar Links:**
  * 📋 **My Forms / Events**
  * ✏️ **Form Builder & Embed Snippet**
  * 📊 **Submissions & CSV Export**
  * ⚙️ **Settings**
* **Removed Panels:** Ticket Scanner, QR Passport Views, Theme Marketplace, Skin Customizer, Waitlist Queues.
