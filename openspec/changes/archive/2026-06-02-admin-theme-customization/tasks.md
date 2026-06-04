## 1. UI Toggle Implementation in portal/page.tsx

- [x] 1.1 Add `adminTheme` state hook and local storage synchronization to `portal/page.tsx`.
- [x] 1.2 Wrap the root layout returned container in `portal/page.tsx` with a dynamic theme class (`light-admin` / `dark-admin`).
- [x] 1.3 Insert the admin theme toggle control in the navigation sidebar above the user context section in `portal/page.tsx`.

## 2. Stylesheet Customizations in globals.css

- [x] 2.1 Define root container and sidebar background/border color overrides under `.light-admin` selector in `globals.css`.
- [x] 2.2 Map common tailwind card (`bg-slate-900/x`), list, and tables background/border classes to high-contrast white/light gray colors under `.light-admin` selector.
- [x] 2.3 Add overrides for form elements (inputs, select dropdowns, labels, descriptions) to display dark text on light backdrops under `.light-admin` selector.

## 3. Build & Run Verification

- [x] 3.1 Run workspace verification check (`pnpm --filter dashboard build`) to confirm compilation safety.
