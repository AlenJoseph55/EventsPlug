## Context

The EventsPlug organizer admin panel (`portal/page.tsx`) uses a dark palette defined by dark-themed Tailwind CSS utility classes. Introducing a light mode requires a design that can dynamically toggle visual styles without extensive refactoring of the 5,000+ line React component, preserving system stability.

## Goals / Non-Goals

**Goals:**
- Provide a responsive dark and light mode for the admin panel layout.
- Persist user theme preference in `localStorage` under `eventsplug-admin-theme-preference`.
- Minimize modification footprint in the complex `portal/page.tsx` file.

**Non-Goals:**
- Rewriting all utility classes to use Tailwind `dark:` variants.
- Customizing themes for attendee-facing public views (already completed in a previous change).

## Decisions

### Decision 1: Theme Implementation via CSS Override Class Wrapper
- **Choice**: Use a CSS wrapper class `.light-admin` at the portal root combined with standard stylesheet overrides inside `globals.css`.
- **Alternatives Considered**:
  - *Tailwind class-based dark mode (`dark:bg-slate-900`)*: Rejected due to high risk of regression when editing hundreds of classes in a 5,000+ line TSX file.
  - *React Inline Styles*: Rejected due to poor performance and layout readability.
- **Rationale**: The CSS wrapper keeps modifications in the TSX file minimal (a single state hook, theme toggle, and root class mapping) while keeping all light-theme design values isolated within the CSS layer.

### Decision 2: Theme Persistence in Local Storage
- **Choice**: Use `localStorage` to save user theme selection.
- **Rationale**: This is a simple and reliable client-side persistence strategy that matches the theme persistence logic of the attendee hub.

## Risks / Trade-offs

- **Risk**: Hardcoded Tailwind text or background colors in some parts of the dashboard might not get correctly overridden by CSS rules.
  - *Mitigation*: Define wide-scope CSS rule selectors matching common dark tailwind classes (e.g. `.bg-slate-900\/40`) and use `!important` to enforce light mode overrides.
