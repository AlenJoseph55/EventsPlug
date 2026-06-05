## 1. Modal Sizing & Live Preview Toggle

- [x] 1.1 Add the `showPreview` boolean state (defaulting to `true`) in `EditEventModal.tsx`.
- [x] 1.2 Implement the "Hide Preview" / "Show Preview" toggle button on the right side of the navigation tabs container in `EditEventModal.tsx`, visible only when `activeTab === "fields"`.
- [x] 1.3 Update the modal wrapper container's width class to dynamically toggle between `md:max-w-2xl` (when in the Details tab, or when preview is hidden) and `md:max-w-5xl` (when in the Fields tab and preview is shown).
- [x] 1.4 Adjust the grid column classes in the Fields tab section of `EditEventModal.tsx` to conditionally span the full width (`w-full`) when `showPreview` is false, and hide the right column Live Preview container entirely.

## 2. Typography Normalization

- [x] 2.1 Update text labels (Field Label, Placeholder, Choices) in the Field Editor inline properties card inside `EditEventModal.tsx` from `text-[10px]` to `text-xs font-bold mb-1.5 uppercase tracking-wide`.
- [x] 2.2 Update control section headers (Add Input, Presets) and edit header text inside `EditEventModal.tsx` from `text-[11px]` to `text-xs`.
- [x] 2.3 Update field labels in `RegistrationForm.tsx` from `text-[10px] font-extrabold uppercase tracking-wide opacity-80` to `text-xs font-bold uppercase tracking-wide opacity-90`.
- [x] 2.4 Update input field placeholder and values in `RegistrationForm.tsx` from `text-xs` to `text-sm` and slightly increase input vertical/horizontal padding to `px-4 py-2.5` to maintain spacing proportions.
- [x] 2.5 Update the submit button text in `RegistrationForm.tsx` from `text-xs font-extrabold` to `text-sm font-extrabold` and adjust its padding.

## 3. Verification & Build

- [x] 3.1 Run dashboard build script to verify that the application compiles with zero TypeScript or syntax errors.
- [x] 3.2 Verify layout transition and typography legibility in the web browser.
- [x] 3.3 Fix preset removal to retain overlapping fields of other active presets.
