## Context

The Custom Registration Form Builder relies on instant state changes (e.g. toggling the inline property editor, dragging fields, applying presets). These abrupt layout shifts can feel disorienting and do not match the premium, modern aesthetic guidelines outlined in `CLAUDE.md`.

## Goals / Non-Goals

**Goals:**
- Implement smooth, fast, and minimal visual transitions for the form builder interface.
- Add an accordion expand/collapse animation for the inline property editor using the modern CSS Grid-row height animation technique.
- Improve drag-and-drop reordering visuals with a lifted state and smooth transitions.
- Animate field additions, preset applications, and confirmation/warning alerts with exit/enter transitions.
- Respect `prefers-reduced-motion` media queries.

**Non-Goals:**
- Do not introduce heavy, complex third-party animation libraries (e.g., Framer Motion, GSAP) that could trigger React 19 peer-dependency warnings or bloat the bundle.
- Do not add intrusive page transitions or decorative animations unrelated to user actions.

## Decisions

### 1. CSS Grid-Row Height Animation for Accordion
Toggling the inline property editor shifts the vertical height of the fields list. Animating `height: auto` is traditionally difficult without JavaScript measurements.
- **Decision**: Wrap the property editor contents in a CSS Grid container transitioning `grid-template-rows` from `0fr` to `1fr`.
- **Alternatives Considered**: Animating `max-height` (causes layout stutter and timing issues if max-height is set too large) or using a JavaScript-based height measurement hook (causes layout recalculation thrashing).

### 2. Native HTML5 Drag-and-Drop Visual States
- **Drag Image Capture**: Defer setting the `draggedIndex` state using `setTimeout(() => setDraggedIndex(idx), 0)` in `handleDragStart`. This allows the browser to capture a fully solid, opaque visual image of the row for the mouse overlay before the list placeholder styles are applied.
- **Placeholder Slot Styling**: Style the active placeholder slot in the list with a solid background and dashed borders, reducing text opacity or hiding interactive buttons to represent an empty slot without visual overlay confusion.
- **Alternatives Considered**: Direct state update in `onDragStart` (captured transparent layout in browser drag image, causing overlapping/messy overlays).

### 3. CSS-First Transition Performance
- **Decision**: Rely entirely on CSS Transitions on hardware-accelerated properties (`transform`, `opacity`, `background-color`, `border-color`) with deceleration curves (`ease-out-quart`: `cubic-bezier(0.25, 1, 0.5, 1)`) matching the guidelines.
- **Alternatives Considered**: Using Tailwind CSS native transitions vs raw CSS. We will define clean Tailwind utility classes using custom classes mapping to `globals.css` transitions.

## Risks / Trade-offs

- **[Risk] Layout shifts during reordering** → *Mitigation*: Ensure container bounds are stable during drag-and-drop operations, and exit editing states before reordering to keep the drag preview clean.
