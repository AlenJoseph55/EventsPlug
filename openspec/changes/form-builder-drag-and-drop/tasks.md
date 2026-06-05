## 1. Drag-and-Drop State & Handlers

- [x] 1.1 Add the `draggedIndex` and `dragOverIndex` states to `EditEventModal.tsx`.
- [x] 1.2 Implement native HTML5 drag event handlers (`handleDragStart`, `handleDragOver`, `handleDragEnd`, `handleDragLeave`) in `EditEventModal.tsx` to handle item swapping in the local `editingFields` array.
- [x] 1.3 Configure `handleDragEnd` to calculate final order mappings and dispatch the existing `reorderFields` mutation.

## 2. UI Layout & Visual Styling

- [x] 2.1 Replace the Up/Down buttons (`▲` / `▼`) in the active fields list with a keyboard-focusable drag handle button showing the drag indicator symbol (`⠿`).
- [x] 2.2 Apply drag-specific Tailwind classes (like `draggable={true}`, `cursor-grab`, `active:cursor-grabbing`, `opacity-50` when dragging, and border styling changes on drop targets).

## 3. Keyboard & Accessibility Support

- [x] 3.1 Implement keyboard listeners (`onKeyDown`) on the focusable drag handles to allow reordering of rows via `ArrowUp` / `ArrowDown` keys for accessibility compliance.

## 4. Verification & Build

- [x] 4.1 Run dashboard build script to check for compilation or TypeScript errors.
- [x] 4.2 Verify drag-and-drop and keyboard reordering behaviors interactively.
