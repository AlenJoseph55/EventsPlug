## Context

The Custom Registration Form Builder workspace inside `EditEventModal.tsx` contains two columns (Form Builder Controls and Live Form Preview). Currently, this is a fixed split-pane layout forcing the modal to have a wide width (`md:max-w-5xl`). On small-to-medium screen sizes (e.g. laptop screens), this layout becomes congested. 

Additionally, the labels inside the Field Editor and the fields/buttons inside the `RegistrationForm` component itself use small text sizes (such as `text-[10px]`), which decreases readability and violates general accessibility principles.

## Goals / Non-Goals

**Goals:**
- Provide organizers with a toggle to collapse/expand the Live Preview pane in the registration form builder.
- Smoothly transition the modal container's width between a wide double-column layout (`md:max-w-5xl`) and a compact single-column layout (`md:max-w-2xl`) when the preview is toggled.
- Scale up the typography sizes across the Field Editor and the Registration Form widget to standard Tailwind typography sizes (`text-xs` for labels, `text-sm` for input values/buttons).

**Non-Goals:**
- Making backend API changes or database migrations.
- Changing the embed implementation or styling of the registration form outside of typography sizing and spacing adjustments.

## Decisions

### 1. Transient Toggle State in Modal
We will use a simple React state variable `showPreview` inside the `EditEventModal` component to track the preview pane's visibility.
* **Why**: The toggle preference is local and transient; there is no need to persist it to local storage or the database.
* **Alternatives Considered**: Persisting in local storage. Rejected because the default state is lightweight and a simple `true` state on load is intuitive.

### 2. Standard CSS Transitions for Modal resizing
We will transition the modal width smoothly using Tailwind's existing `transition-all duration-300` classes on the modal frame.
* **Why**: The modal wrapper already has transition classes configured. Adjusting the width class dynamically from `md:max-w-5xl` to `md:max-w-2xl` automatically triggers a smooth, hardware-accelerated CSS transition.

### 3. Normalize Font Sizes to Tailwind Sizing Tokens
Instead of arbitrary pixel-based custom classes (like `text-[10px]`), we will scale up text to standard tokens:
- Form field labels: `text-xs` (12px)
- Section header details: `text-xs` (12px)
- Form inputs / select fields: `text-sm` (14px)
- Submit button text: `text-sm` (14px)
* **Why**: Standard Tailwind tokens align better with our design system. Specifically, increasing the registration form's inputs from `text-xs` to `text-sm` (14px) improves legibility and prevents mobile Safari from auto-zooming on focus.

## Risks / Trade-offs

- **Risk: Layout Shift on Resizing** → The transition of the modal width might cause some text wrapping or temporary layout shift. 
  * *Mitigation*: Ensure fields inside the active list and property card have flexible flex/grid layouts that handle width shifts gracefully.
- **Risk: Form Preview hidden by default on mobile** → On small screens, side-by-side isn't possible anyway.
  * *Mitigation*: Ensure the Live Preview is hidden/stacked nicely on mobile viewports using standard responsive classes (e.g. `lg:col-span-5` for grid control).
