## Context

The custom form builder in [EditEventModal.tsx](file:///Users/alen/Code/EventsPlug/apps/dashboard/src/components/portal/modals/EditEventModal.tsx) currently uses Up/Down arrow buttons (`▲` / `▼`) next to each field row. Clicking these buttons triggers a reordering mutation.

To build a premium workspace, we will replace this model with a direct drag-and-drop (DnD) list sorting model.

## Goals / Non-Goals

**Goals:**
- Implement a drag-and-drop list reordering interface for form fields.
- Apply visual drag states (reduced opacity on the dragged row, border outlines on drop targets).
- Trigger a single transactional reordering REST API call (`reorderFields`) once the drag gesture completes.
- Retain full accessibility for keyboard and screen-reader users by adding a keyboard fallback on the drag handles.

**Non-Goals:**
- Installing third-party libraries (like `@dnd-kit` or `@hello-pangea/dnd`) which might present installation errors or peer dependency warnings in the React 19 environment.
- Changing database schemas or creating new API endpoints (we will consume the existing `PATCH /api/events/:eventId/fields/reorder` endpoint).

## Decisions

### 1. Leverage Native HTML5 Drag and Drop API
We will use native HTML5 drag events (`onDragStart`, `onDragOver`, `onDragEnd`, `onDragLeave`) to handle list reordering.
* **Why**: The native API requires zero external npm packages, keeping the bundle size minimal and avoiding potential peer dependency warnings with React 19.
* **Alternatives Considered**: `@hello-pangea/dnd` or `@dnd-kit/core`. Rejected because of package version conflicts with React 19.

### 2. UI State for Active Drag Index
We will track the active drag indexes in the local state of `EditEventModal`:
`const [draggedIndex, setDraggedIndex] = useState<number | null>(null);`
`const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);`
* **Why**: Simple indices are sufficient to calculate item swaps and apply conditional visual classes.

### 3. Keyboard/Accessibility Fallback
The drag handle will support standard tab-focus. Pressing `ArrowUp`/`ArrowDown` on a focused drag handle will shift the field's index immediately and trigger the mutation.
* **Why**: Ensures screen-reader and keyboard-only users can fully manage form field ordering.

## Risks / Trade-offs

- **Risk: Mobile Touch Devices support** → Native HTML5 Drag and Drop has poor touch support on some mobile browsers.
  * *Mitigation*: We will use CSS touch-action properties and ensure the keyboard reordering controls work correctly, or we can retain the focusable arrow keys.
