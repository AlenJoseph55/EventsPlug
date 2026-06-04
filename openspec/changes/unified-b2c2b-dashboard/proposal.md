## Why

We want to completely deprecate the traditional administrative dashboard model (left sidebar menu + tabular tabs). Instead of a split, administrative SaaS vibe, the EventsPlug portal dashboard (`/portal`) will be styled as a consumer-facing **Attendee-First Card Feed** (similar to Partiful or Luma). 

A logged-in user will see:
1. A stream of their active RSVP tickets.
2. A list of events they are hosting, styled as dynamic cards.
3. Access to administrative actions (such as managing registrants, editing flyers, configuring organization custom CSS themes, and inviting team members) directly inline on their respective cards via modals/drawers.

This results in a zero-barrier, unified layout matching the attendee aesthetics, completely removing the need for a separate side navigation panel.

---

## What Changes

* **Remove Sidebar Navigation**: Delete `PortalSidebar.tsx` and strip sidebar layouts from the orchestrator page.
* **Top Bar Header**: Implement a simplified centered top navigation header on the portal page.
* **Card-Based Feed Layout**: Build a centered single-stream feed displaying ticket RSVPs and hosted event cards. If the user has zero registered tickets, prioritize the hosted events section at the top of the feed and omit the empty tickets placeholder.
* **Inline Card Actions**:
  - Event cards will have buttons to open edit details, view registrations list, and configure widget settings in-context using modal dialogs.
  - Organization configurations (custom CSS, team invites, logo uploads) will be managed from a central "Organization Settings Card" at the bottom of the feed.
* **Inline Creation**: The "Create Event" flow will mount inside a card button in the hosting stream, launching the wizard inside a modal container.

---

## Capabilities

### Modified Capabilities
* `portal-dashboard`: Redesign the console orchestrator from a sidebar shell layout to a unified card feed.
