## Why

The Custom Registration Form Builder currently uses fixed-width side-by-side columns (Field Editor and Live Preview), which expands the modal width to `md:max-w-5xl`. This layout becomes cramped and hard to use on smaller desktop screens (e.g. 13-inch laptops). Furthermore, the form labels and inputs inside the Field Editor and the Registration Form use sub-standard font sizes (like `text-[10px]` and `text-xs`) that are illegible on many screens and cause automatic zoom-in behaviors on mobile devices.

Adding a collapsible preview option and normalizing the typography to standard Tailwind tokens will resolve these legibility and layout constraints.

## What Changes

- **Collapsible Live Preview**: Add a responsive toggle button to show or hide the Live Preview panel in the Custom Registration Form tab.
- **Dynamic Modal Sizing**: Animate the modal width smoothly between a wide layout (`md:max-w-5xl`) when the preview is visible, and a compact single-column layout (`md:max-w-2xl`) when the preview is hidden.
- **Typography Scale-up & Normalization**:
  - Scale up field property editor labels in `EditEventModal.tsx` from `text-[10px]` to `text-xs`.
  - Scale up section header titles (like "Add Input:" and "Presets:") from `text-[11px]` to `text-xs`.
  - Scale up attendee registration form labels in `RegistrationForm.tsx` from `text-[10px]` to `text-xs`.
  - Scale up attendee registration form input texts in `RegistrationForm.tsx` from `text-xs` to `text-sm` for improved readability and focus compliance.
  - Scale up the registration form submit button text from `text-xs` to `text-sm`.

## Capabilities

### New Capabilities
*None*

### Modified Capabilities
- `events`: Customize registration forms with a collapsible live preview.

## Impact

- **Affected Code**: `EditEventModal.tsx` and `RegistrationForm.tsx` inside `apps/dashboard`.
- **APIs**: No backend API changes are required.
- **Dependencies**: Uses standard Tailwind CSS and existing state management in React.
