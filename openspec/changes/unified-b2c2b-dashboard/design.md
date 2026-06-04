## Feed Layout Architecture

The redesigned `/portal` dashboard uses a centered, scrollable single-column layout on a premium frosted backdrop.

```
┌──────────────────────────────────────────────┐
│                  TOP BAR                     │
│  Logo                        Logout Button   │
├──────────────────────────────────────────────┤
│                                              │
│  🎟️  Your RSVP Tickets                       │
│  [ Ticket Card Grid ]                        │
│                                              │
│  🚀  Your Hosted Events                      │
│  [ Event Control Decks ]                     │
│  [ + Create Event Card Trigger ]             │
│                                              │
│  ⚙️  Organization Settings                    │
│  [ Unified Host Customizer Card ]            │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 1. Card Control Decks

### A. RSVP Ticket Card
- Displays the event name, date stub, location, and guest registration code.
- Clicking **"View Scan Pass"** launches the ticket QR check-in modal.

### B. Hosted Event Card
- Displays event details, active/inactive toggle status, and registration capacity index bar.
- Action triggers:
  - **"Registrations"**: Launches a Modal container displaying attendee details for the event (with CSV export capability).
  - **"Edit Details"**: Launches the event editor modal.
  - **"Delete / Share"**: Launches confirmation/QR link overlays.

### C. Create Event Card Button
- Placed as a dashed-outline card in the hosted stream.
- Clicking it launches the event creation form inside an overlay modal.

### D. Organization Customizer Card
- Located at the bottom of the feed for tenant configurations.
- Action triggers:
  - **"Hub Customizer"**: Modal allowing customization of hub slug, title, description, accents, backdrop themes, and custom CSS overrides.
  - **"Team Members"**: Modal to invite and manage team collaborator roles.

---

## 2. Shared Background Backdrop
- Integrates the dynamic Dot Matrix backdrop layout at the core container wrapper:
  ```css
  background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 12px 12px;
  ```

---

## 3. Dynamic Ordering Rule
We fetch both `tickets` (RSVPs) and `events` (hosted) at the page level:
* **IF `tickets.length > 0`**: Mount `tickets` at the top of the feed, followed by `events`.
* **IF `tickets.length === 0`**: Prioritize `events` at the top of the feed. The empty ticket container is completely hidden so the user sees their hosted list immediately without any vertical layout gaps.

