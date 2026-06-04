## Why

The current admin dashboard uses a deep blue background with indigo accents. To align the application with a more professional, modern, and sleek design system, we need to transition the admin panel theme colors to a neutral zinc-based color scheme with vibrant blue accents for both Light and Dark modes.

## What Changes

- **Modified Admin Theme System**: Update CSS custom properties in `globals.css` to use Zinc shades for backgrounds, cards, lists, and borders.
- **Accents Update**: Replace indigo primary accents (`#6366f1` / `#4f46e5`) with a standard vibrant blue (`#2563eb` / `#3b82f6`) across both dark and light modes.
- **Dashboard Consistency**: Verify metrics, tables, active states, text colors, and background contrasts match the screenshots provided by the user.

## Capabilities

### New Capabilities

*None*

### Modified Capabilities

- `themes`: Update admin panel theme layout colors to use a zinc-neutral and blue-accent color system in both Light and Dark modes.

## Impact

- `apps/dashboard/src/app/globals.css`: Updates to CSS color tokens (`--background`, `--bg-app`, `--bg-panel`, `--border-main`, `--accent-primary`, etc.).
- Component styles and layouts in `apps/dashboard/src/components/portal/` or related dashboard pages to ensure custom overrides do not conflict with the new color palette.
