## Context

The EventsPlug admin panel needs to be themed using a clean Zinc neutral background coupled with a vibrant blue accent palette. This is a design-centric update that will replace the previous slate-and-indigo-based palette.

## Goals / Non-Goals

**Goals:**
- Update CSS custom properties in `globals.css` to transition from indigo/slate to zinc/blue.
- Ensure proper color contrast (WCAG compliance) for text, badges, borders, and active/hover states.
- Retain the theme toggling behavior via class propagation (`.light-admin`).
- Update the `.dark-preview` class wrapper to use the new zinc-based dark theme variables.

**Non-Goals:**
- Changing component JSX structure or removing Tailwind utility classes.
- Modifying attendee-facing widgets or public pages.

## Decisions

### Decision 1: Zinc and Blue Theme Colors Selection

We will map the new palettes to the CSS custom properties in `globals.css` as follows:

| CSS Variable | Old Dark (Slate/Indigo) | New Dark (Zinc/Blue) | Old Light (Slate/Indigo) | New Light (Zinc/Blue) |
| --- | --- | --- | --- | --- |
| `--background` | `#090d16` | `#09090b` (zinc-950) | `#f8fafc` | `#ffffff` |
| `--bg-app` | `#090d16` | `#09090b` (zinc-950) | `#f8fafc` | `#ffffff` |
| `--bg-panel` | `#0d1321` | `#18181b` (zinc-900) | `#ffffff` | `#ffffff` |
| `--bg-panel-hover` | `#161f30` | `#27272a` (zinc-800) | `#f1f5f9` | `#f4f4f5` (zinc-100) |
| `--bg-panel-alt` | `#05070c` | `#09090b` (zinc-950) | `#f8fafc` | `#f4f4f5` (zinc-100) |
| `--text-primary` | `#f8fafc` | `#fafafa` (zinc-50) | `#0f172a` | `#09090b` (zinc-950) |
| `--text-secondary` | `#94a3b8` | `#a1a1aa` (zinc-400) | `#475569` | `#71717a` (zinc-500) |
| `--text-muted` | `#64748b` | `#71717a` (zinc-500) | `#64748b` | `#a1a1aa` (zinc-400) |
| `--border-main` | `rgba(255,255,255,0.08)` | `#27272a` (zinc-800) | `rgba(15,23,42,0.08)` | `#e4e4e7` (zinc-200) |
| `--border-muted` | `rgba(255,255,255,0.04)` | `#18181b` (zinc-900) | `rgba(15,23,42,0.04)` | `#f4f4f5` (zinc-100) |
| `--accent-primary` | `#6366f1` | `#2563eb` (blue-600) | `#4f46e5` | `#2563eb` (blue-600) |
| `--accent-hover` | `#4f46e5` | `#1d4ed8` (blue-700) | `#3730a3` | `#1d4ed8` (blue-700) |

For status semantic colors (success, danger, warning), we will keep their relative hue values, but align them with tailwind standard red/amber/emerald values:
- Dark success text: `#10b981` (emerald-500)
- Dark success bg: `rgba(16, 185, 129, 0.1)`
- Dark danger text: `#ef4444` (red-500)
- Dark danger bg: `rgba(239, 68, 68, 0.1)`
- Dark warning text: `#f59e0b` (amber-500)
- Dark warning bg: `rgba(245, 158, 11, 0.1)`

## Risks / Trade-offs

- **Risk**: Hardcoded Tailwind colors or custom components with static slate/indigo utility classes might bypass variables.
- **Mitigation**: Inspect the admin portal layout and verify that active components correctly consume theme variables or adapt them accordingly.
