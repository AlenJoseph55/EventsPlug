## Why

The current custom registration form builder in the organizer dashboard is congested and hard to use. All event properties (metadata, poster uploads, limits) and the form builder interface (presets, reordering, active fields, inline editing, and the quick-add form) are stacked vertically in a single modal scroll-view. This layout causes readability issues, visual clutter, and forces the organizer to work without immediate visual feedback on how their changes affect the actual attendee form.

## What Changes

- **Tabbed Layout**: Split the `EditEventModal` into two distinct tabs: `📝 Basic Details` and `🛠️ Registration Form`.
- **Split-Pane Builder View**: When the `Registration Form` tab is active, expand the modal width (`max-w-5xl` on desktop) to support a dual-column workspace:
  - **Left Pane (Builder controls)**: Contains preset templates, field type palette, active field list, and reordering actions.
  - **Right Pane (Live Preview)**: Integrates a reactive preview of the attendee-facing form.
- **Live Form Preview**: Embed the existing `<RegistrationForm preview={true} />` component in the preview pane. It will sync in real-time with the local state of the form fields as they are added, reordered, modified, or removed.
- **Quick-Add Palette**: Replace the bulky Quick-Add form with a visual toolbar. Clicking a field type instantly appends the field with default values and initiates focus-edit mode.
- **Responsive Layout**: Ensure the tabbed and split layouts collapse gracefully into a single-column, bottom-sheet-friendly format on mobile viewports.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `events`: Organizers SHALL be provided with a split-pane, tabbed workspace inside the Edit Event Modal to manage form fields, featuring a real-time reactive preview and a quick-add field type palette.

## Impact

- **UI Components**:
  - `apps/dashboard/src/components/portal/modals/EditEventModal.tsx` (major layout, responsive styling, state restructuring for tabs and editor view).
- **Widgets**:
  - `apps/dashboard/src/components/RegistrationForm.tsx` (verified compatibility as it is already built with custom field inputs and preview constraints).
- **Design Tokens / CSS**:
  - Re-uses existing Tailwind v4 utilities and custom variables without requiring new global stylesheet definitions.
