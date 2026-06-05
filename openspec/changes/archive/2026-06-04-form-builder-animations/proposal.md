## Why

The Custom Registration Form Builder currently lacks visual feedback and layout transition smoothing, making actions like drag-and-drop reordering, quick-adds, preset applications, and property editor expansion feel jarring. Adding fast, minimal, and purposeful transitions improves the spatial hierarchy and overall premium feel of the organizer dashboard.

## What Changes

- **Drag-and-Drop Motion**: Add smooth translation transitions (FLIP-like or transition-based transforms) and distinct active/lift states during drag-and-drop.
- **Smooth Expand/Collapse**: Implement height/grid-row transition animations for the inline field property editor, replacing the instant show/hide toggle.
- **Enter/Exit Reveals**: Add subtle fade-in and slide reveals for newly inserted fields, preset inclusions, and warnings/confirmations.
- **Reduced Motion Support**: Ensure all animations respect `prefers-reduced-motion` settings.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `events`: Organizers SHALL see smooth, fast, and responsive visual transitions when reordering fields, editing field properties, or inserting/removing fields.

## Impact

- **Frontend Dashboard**: `EditEventModal.tsx`, `globals.css`.
- **API & Backend**: None. No API endpoint or database schema changes.
