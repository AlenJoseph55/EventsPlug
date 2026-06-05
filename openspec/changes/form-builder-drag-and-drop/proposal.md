## Why

Reordering custom registration form fields using simple Up/Down buttons (`▲` / `▼`) is click-intensive and visually cluttered. Introducing a drag-and-drop sorting mechanism will provide a much more intuitive, fluid, and premium experience for event organizers structuring registration forms.

## What Changes

- **Drag Handle Interface**: Add a visual drag handle (`⠿`) next to each field in the active fields list.
- **Interactive Drag-and-Drop Sorting**: Enable drag-and-drop sorting of fields within the form fields editor pane.
- **Visual Feedback**: Apply ghost dragging states and styling transitions (such as reduced opacity and dashed borders) on the actively dragged row.
- **Keyboard Navigation Fallback**: Ensure the drag handle can be focused and supports keyboard navigation (e.g. arrow keys) for full accessibility.

## Capabilities

### New Capabilities
*None*

### Modified Capabilities
- `events`: Organizers SHALL be able to reorder registration form fields using drag-and-drop interactions.

## Impact

- **Affected Code**: [EditEventModal.tsx](file:///Users/alen/Code/EventsPlug/apps/dashboard/src/components/portal/modals/EditEventModal.tsx) inside the dashboard application.
- **APIs**: The change will consume the existing `PATCH /api/events/:eventId/fields/reorder` endpoint (no backend changes required).
- **Dependencies**: Native HTML5 Drag and Drop API will be used to avoid library compatibility issues with React 19.
