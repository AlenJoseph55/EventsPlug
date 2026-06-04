## MODIFIED Requirements

### Requirement: Admin Panel Theme Mode Toggle
The administrator portal SHALL support a Theme Mode toggle that shifts the interface layout colors between Light and Dark mode options using a zinc-neutral and blue-accent color scheme.

#### Scenario: Toggle Admin Panel Theme Mode
- **WHEN** an administrator clicks the Theme Toggle button in the portal sidebar navigation
- **THEN** the interface layout theme switches between dark (default) and light modes, applying the zinc-neutral base colors and blue accent highlight colors, and the selection is saved in local storage

#### Scenario: Load Admin Panel Saved Theme
- **WHEN** the administrator portal is loaded
- **THEN** the system checks local storage and applies the saved theme preference, defaulting to dark mode with the zinc-neutral base and blue accent colors if no preference exists
