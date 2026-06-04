## Why

Currently, the organizer admin panel dashboard is styled with a fixed dark-themed palette. Adding a Light/Dark Mode toggle to the admin panel allows organizers who prefer a high-contrast light workspace to manage their events and registration list comfortably under varied ambient lighting conditions.

## What Changes

- Add a theme toggle switch in the dashboard portal navigation sidebar.
- Persist the selected admin theme preference in `localStorage` under `eventsplug-admin-theme-preference`.
- Implement a theme wrapper class (`light-admin` / `dark-admin`) at the portal page root.
- Add CSS overrides in `globals.css` to map dark utility colors to light equivalents.

## Capabilities

### New Capabilities

### Modified Capabilities

- `themes`: Add requirements for supporting Light and Dark modes in the administrator dashboard panel, in addition to client-facing public directory landing pages.

## Impact

- **Frontend UI (`portal/page.tsx`)**: Root layout wrapping, toggle switch element, and local storage state wiring.
- **Frontend Styles (`globals.css`)**: Global override rules targeting tailwind background/border/text utility classes inside the light theme scope.
