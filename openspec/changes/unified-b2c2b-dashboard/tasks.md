- [ ] Phase 1: Clean Up Layout & Deprecate Sidebar
  - [ ] Delete or bypass `PortalSidebar.tsx` imports in `apps/dashboard/src/app/portal/page.tsx`
  - [ ] Reconfigure the main layout wrapper to use a centered, scrollable single-column feed without a left sidebar

- [ ] Phase 2: Card Feed Orchestrator
  - [ ] Build a top bar containing the EventsPlug brand logo and a Logout button
  - [ ] Render the ticket RSVP feed using `useAttendeeRegistrations` hook
  - [ ] Render the hosted events feed using `useEvents` hook
  - [ ] Implement conditional rendering prioritizing hosted events at the top if tickets list is empty, hiding the empty tickets container
  - [ ] Create a card button interface for event creation in the hosted stream

- [ ] Phase 3: In-Context Modals & Overlays
  - [ ] Convert the **Create Event** wizard tab into a modal view overlay
  - [ ] Convert the **Registrations List** tab into a modal dialog launched from the event card
  - [ ] Convert the **Hub Customization** form into a modal dialog launched from the settings section
  - [ ] Convert the **Team Members** manager into a modal dialog launched from the settings section
  - [ ] Convert the **Widget Themes** selector into a modal dialog launched from the settings section

- [ ] Phase 4: Styling Integration
  - [ ] Add the premium Dot Matrix radial backdrop configuration to the central background layout
  - [ ] Ensure all action buttons (Edit, Share, Delete, Registrations) are cleanly aligned on each card
