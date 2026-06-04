## Why

The current version of EventsPlug only supports single-user organizations where the registering user has full admin/organizer capabilities. In institutional settings, event operations are collaborative and require multiple users with different access levels (e.g., event creators/managers, read-only registration viewers, and tenant admins) to prevent unauthorized configurations while enabling team collaboration.

## What Changes

- **RBAC Role Expansion**: Expand user roles from two global roles to a hierarchy of four: `SUPER_ADMIN` (platform), `ADMIN` (tenant owner), `MANAGER` (event operations), and `MEMBER` (read-only viewer).
- **Direct Member Provisioning**: Allow organization `ADMIN` users to directly create new member accounts with assigned roles (email, initial password, and role selection).
- **Endpoint Authorization Controls**: Protect backend APIs via an updated `RolesGuard` to validate role-based permissions before execution.
- **UI RBAC Enforcement**: Adapt the dashboard UI to hide or disable components (like customization options, settings, event modification, and form-building) based on the current user's role.

## Capabilities

### New Capabilities
- `user-management`: Enables administrators to view, add/provision, edit, and remove team members within their organization.

### Modified Capabilities
- `auth`: Update the authentication/authorization capabilities to handle a multi-tier role hierarchy (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`) and enforce role-based access checks.
- `events`: Enforce event creation, modification, and deletion access controls so that only `SUPER_ADMIN`, `ADMIN`, and `MANAGER` users can modify events.

## Impact

- **Database**: The `UserRole` enum and `User` table in the database schema will require migration updates.
- **Backend APIs**: Controllers (events, preferences, uploads, registrations) will require guard updates to enforce RBAC rules.
- **Frontend Dashboard**: State management and page templates will need checks on the active user's role to adapt UI actions.
