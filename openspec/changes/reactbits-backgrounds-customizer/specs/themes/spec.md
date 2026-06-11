## ADDED Requirements

### Requirement: Standalone Hub Style Presets
The system SHALL provide a set of predefined, curated style presets (Vibeboxes) in the Customization panel that apply accent colors, skins, and backgrounds simultaneously.

#### Scenario: Apply Vibe Preset
- **WHEN** an organizer selects one of the 4 curated style presets (Glassmorphism, Cyber Grid, Cozy Soft, Retro Arcade)
- **THEN** the hub accent color, skin ID, and backdrop style are updated to match the preset's definitions in the Customizer state.

### Requirement: Collapsible Advanced Customizer panel
The Customizer panel SHALL hide granular customizers (direct color inputs, individual skin dropdowns, specific backdrop styles) behind a collapsible advanced panel to keep the default editor clean and simple.

#### Scenario: Toggle Advanced panel
- **WHEN** an organizer clicks the Advanced Customization toggle
- **THEN** the granular hex inputs, skin overrides, and specific backdrop dropdowns expand or collapse.
