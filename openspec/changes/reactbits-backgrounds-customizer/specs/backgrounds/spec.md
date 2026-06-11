## ADDED Requirements

### Requirement: React Bits Background Integration
The system SHALL support 7 dynamic background presets (lightfall, siderays, lightrays, aurora, gradient, pixelsnow, shapegrid) and render them on public hubs and event pages.

#### Scenario: Render Background Preset
- **WHEN** a public hub or event page is loaded with a specific backdrop preset active (e.g. pixelsnow)
- **THEN** the corresponding client-only canvas/CSS background component is rendered dynamically without server-side rendering.

### Requirement: Dynamic Color Binding for Backgrounds
The dynamic background components SHALL read and utilize the active brand accent HSL color variables (`var(--hub-accent-color)`) at runtime.

#### Scenario: Render Accent Color in Background
- **WHEN** a background component (e.g. lightfall) is rendered
- **THEN** it draws particles or rays matching the active, contrast-adjusted brand accent color.
