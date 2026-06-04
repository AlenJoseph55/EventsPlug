## 1. CSS Theme Color Update

- [x] 1.1 Update default dark theme variables in `:root` inside `apps/dashboard/src/app/globals.css` to use the zinc-neutral base and blue accent palette.
- [x] 1.2 Update light theme overrides in `.light-admin` inside `apps/dashboard/src/app/globals.css` to use the white/zinc-neutral base and blue accent palette.
- [x] 1.3 Update preview wrapper `.dark-preview` inside `apps/dashboard/src/app/globals.css` to use the new dark theme zinc and blue variables.

## 2. Component Verification & Alignment

- [ ] 2.1 Verify that the main layout, sidebar, active/inactive item states, and font colors properly reflect the new zinc-neutral background and blue-accent styles in both light and dark modes.
- [ ] 2.2 Inspect overview cards, table headers, table rows, and metrics inside the portal dashboard pages to ensure no hardcoded slate/indigo styles override the new CSS variables.
- [ ] 2.3 Verify that status badges, action cards, and the theme switcher button display correctly.
