## Context

The current EventsPlug database schema specifies a `UserRole` enum containing `ORGANIZER` and `SUPER_ADMIN`. We need to expand this structure to implement role-based controls within an organization, supporting a detailed permission hierarchy.

## Goals / Non-Goals

**Goals:**
- Transition the `ORGANIZER` role to `ADMIN`.
- Introduce `MANAGER` and `MEMBER` roles to the NestJS backend and Next.js frontend.
- Secure backend API endpoints dynamically based on these roles using a NestJS Roles Guard.
- Support direct creation of users by an organization's `ADMIN` (email, password, role assignment).
- Restrict dashboard UI access, actions, and page rendering depending on the active user's permissions.

**Non-Goals:**
- Implementing password-reset or invite-link email flows. Direct provision (admin sets the credentials) is chosen for simplicity in this phase.
- Multi-organization membership for a single user account (each user remains bound to a single `organizationId`).

## Decisions

### 1. Database Schema Role Migration
- **Choice**: Modify the Prisma enum `UserRole` to have values: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`.
- **Migration Path**: Existing `ORGANIZER` records will be updated to `ADMIN` in a database migration.

### 2. User Administration API
- **Choice**: Create `UsersController` at `GET/POST/PATCH/DELETE` `/api/organizations/users`.
- **Authorization**: Only `ADMIN` or `SUPER_ADMIN` users can access member creation, modification, or removal endpoints.

### 3. Granular API Guards
- **Choice**: Update `RolesGuard` to check the request user's role against endpoint permissions:
  - `@Roles(UserRole.SUPER_ADMIN)`: Impersonation / Platform Management.
  - `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)`: Organization settings, member administration, and theme overrides.
  - `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)`: Creating, editing, and deleting events / form builder fields.
  - `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)`: Reading events, exporting registrations.

### 4. Direct Credentials Provisioning
- **Choice**: Admin fills out the new user form specifying an email, temporary password, and role. The backend hashes the password using bcrypt with salt rounds of 10, identical to user signup.

### 5. Frontend Action Guarding
- **Choice**: Create a custom hook `useRole` or read the active user role from `SessionContext`/token inside the dashboard to disable or completely hide pages/buttons.
  - Exclude theme editor options for non-admins.
  - Disable form builder input editing and event creation/deletion for members.

## Risks / Trade-offs

- **[Risk] Existing User Broken Login** → Existing users have `role: 'ORGANIZER'`.
  * **Mitigation**: Database migration maps all `ORGANIZER` roles to `ADMIN` to prevent login issues.
- **[Risk] Admin Account Lockout** → An admin updates their own role to member, locking themselves out.
  * **Mitigation**: Prevent users from editing or deleting their own user account in the member management API.
