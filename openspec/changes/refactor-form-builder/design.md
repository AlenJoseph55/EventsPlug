## Context

The current `EditEventModal` combines event metadata edit controls and form builder settings in one vertically scrolling modal. This design suffers from visual clutter, poor readability, and lack of layout hierarchy. 

We will split this interface into a tabbed layout, widening the modal on the form builder tab to support a side-by-side builder workspace and live preview.

## Goals / Non-Goals

**Goals:**
- Separate event settings and custom fields builder using standard horizontal tabs.
- Integrate the attendee-facing `<RegistrationForm />` as a live preview that updates in real-time.
- Streamline the field creation workflow using a visual field type toolbar palette instead of the full input form.
- Automatically set focus-edit state on newly created fields.
- Keep the interface completely responsive on mobile viewports.

**Non-Goals:**
- Modifying the underlying database schema or custom field CRUD endpoints.
- Introducing external drag-and-drop npm dependencies (we will maintain existing transactional API reordering with polished visual controls).

## Decisions

### 1. Tabbed Modal Architecture and Dynamic Sizing
We will introduce a tab selection state inside the edit event modal:
- **Details Tab**: Shows basic event metadata (Title, Date, Location, Poster, etc.). Modal width is set to `max-w-2xl` for compact editing.
- **Fields Tab**: Shows the split-pane builder. Modal width expands to `max-w-5xl` on desktop (`lg:max-w-5xl`) to accommodate side-by-side builder controls and live preview.

*Alternatives considered:* Keeping a single modal width (`max-w-4xl`) for both tabs. However, a wide modal feels empty for basic event editing, whereas a narrow modal is too cramped for the split-pane workspace. Dynamic sizing provides the best context-aware UX.

### 2. Live Preview Integration via `<RegistrationForm />`
We will render a mock phone/preview frame containing the existing `<RegistrationForm />` component.
- The component will receive a mock event payload fed directly by the local reactive event states:
  ```tsx
  const previewEvent = {
    id: event.id,
    title: editTitle || event.title,
    formFields: editingFields,
  };
  ```
- It will be invoked with `preview={true}` to prevent submit requests and user inputs from executing.

*Alternatives considered:* Writing a separate custom preview renderer. This was rejected because using the actual `RegistrationForm` component guarantees 100% rendering fidelity and saves significant development overhead.

### 3. Click-to-Add Fields Toolbar (Palette)
We will replace the static, full quick-add form with a streamlined horizontal toolbar listing all 6 custom field types (Text, Email, Number, Dropdown, Checkbox, Long Text).
- Clicking any field type instantly calls `handleAddField` with localized defaults (e.g. type `"SELECT"` maps to label `"New Dropdown Choice"`, placeholder `"Choose..."`, and a default option choice `"Option 1"`).
- **Auto-Focus Workflow**: Upon successful API field creation, the new field will automatically trigger `startEditingField(newField)` and set `editingFieldId` so the organizer can customize its label, options, or placeholder immediately.

### 4. Responsive Mobile Fallback
- On viewports below `lg` (1024px), the dual-column grid stacks vertically. The live preview will render beneath the list of fields.
- The modal bottom-sheet swipe handle is maintained for a native mobile experience.

## Risks / Trade-offs

- **[Risk] State Sync Lag during API calls:** Because `addField`, `deleteField`, etc., communicate with the database, there might be a brief delay between clicking an action and the live preview updating.
  - **Mitigation:** Rely on TanStack React Query cache validation, which updates `events` instantly in the client cache, and ensure loading states or disabled states are indicated during mutation cycles.
