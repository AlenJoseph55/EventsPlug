## ADDED Requirements

### Requirement: Event-Scoped Embed Mode
The widget SHALL support an `event-id` attribute as the primary embed mode. When `event-id` is present, the widget SHALL render the registration form for that single event directly, without displaying an event selection list.

#### Scenario: Event-scoped mode activated
- **WHEN** the `<events-plug-widget event-id="evt_abc123">` element is mounted
- **THEN** the widget fetches `GET /api/events/evt_abc123/public` and renders the event registration form directly

#### Scenario: Mode priority
- **WHEN** both `event-id` and `org` attributes are present
- **THEN** `event-id` takes precedence and event-scoped mode is used

#### Scenario: Event not found in event-scoped mode
- **WHEN** the backend returns `404` for the given `event-id`
- **THEN** the widget renders an error state: "Event not found"

### Requirement: Org-Hub Mode Preserved
The existing `org` attribute behavior SHALL continue to function unchanged when `event-id` is not present.

#### Scenario: Org-hub mode fallback
- **WHEN** `<events-plug-widget org="acme-corp">` is mounted without an `event-id` attribute
- **THEN** the widget behaves as before: fetches the org's event list and presents the event selection UI

### Requirement: Registration Closed State in Event-Scoped Mode
When rendered in event-scoped mode, the widget SHALL display appropriate states for capacity-full and closed events.

#### Scenario: Event is CLOSED
- **WHEN** the fetched event has `status: "CLOSED"`
- **THEN** the widget renders a "Registration is closed" state instead of the form

#### Scenario: Event is at capacity
- **WHEN** the fetched event has `maxRegistrations` equal to the current registration count
- **THEN** the widget renders an "Event is full" state instead of the form

## MODIFIED Requirements

### Requirement: Embedded Custom HTML Element
The widget SHALL render as a custom Web Component (`<events-plug-widget>` / `<event-widget>`) identified by an `event-id` attribute (event-scoped mode, primary) or an `org` attribute (org-hub mode, preserved for backwards compatibility).

#### Scenario: Render Widget in Host DOM
- **WHEN** the `<events-plug-widget>` element is mounted in a host webpage
- **THEN** it initializes a Shadow DOM tree, preventing host CSS rule leakage or styling collisions

#### Scenario: Fetch Event Form Fields — event-scoped mode
- **WHEN** the widget mounts with a valid `event-id`
- **THEN** it fetches event metadata and form fields from `GET /api/events/:eventId/public`

#### Scenario: Fetch Event List — org-hub mode
- **WHEN** the widget mounts with an `org` attribute and no `event-id`
- **THEN** it fetches the org's public event list as before
