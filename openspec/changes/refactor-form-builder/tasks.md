## 1. Tabbed Interface and Modal Sizing

- [x] 1.1 Add active tab state (`details` vs `fields`) in `EditEventModal.tsx`.
- [x] 1.2 Add tab bar header navigation below the modal title with smooth transitions.
- [x] 1.3 Update modal wrapper CSS to dynamically size container width (`md:max-w-2xl` for details, `md:max-w-5xl` for form builder tab).
- [x] 1.4 Wrap basic event properties form fields (Title, Date, Location, Limit, Description, Poster, Auto-fit) to render only under the "Details" tab.

## 2. Split-Pane Layout and Quick-Add Toolbar

- [x] 2.1 Refactor the form builder markup to use a split grid on desktop (`grid-cols-1 lg:grid-cols-12`).
- [x] 2.2 Construct the visual Field Type Toolbar palette using clean icons and modern grid cards.
- [x] 2.3 Connect the toolbar buttons to trigger field creation with localized defaults.
- [x] 2.4 Implement auto-focus behavior that opens the new field in focus-edit state once successfully added.
- [x] 2.5 Polish the visual styling of list items, drag-reorder buttons, edit (✏️) and delete (🗑️) icons.

## 3. Live Registration Form Preview

- [x] 3.1 Import `<RegistrationForm />` into `EditEventModal.tsx`.
- [x] 3.2 Construct the reactive preview event payload using live states (`editTitle`, `editingFields`).
- [x] 3.3 Set up the right column preview pane using a modern device mockup frame.
- [x] 3.4 Instantiate `<RegistrationForm event={previewEvent} preview={true} />` within the mockup frame.

## 4. Polish and Verification

- [x] 4.1 Verify fully responsive design collapsing gracefully into vertical scroll on mobile/tablet viewports.
- [x] 4.2 Validate reordering, field editing, presets insertion, and field deletion update the preview in real-time.
- [x] 4.3 Ensure the attendee database warning banner operates correctly when registrations exist.
