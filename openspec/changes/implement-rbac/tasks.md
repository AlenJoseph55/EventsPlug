## 1. Database Schema & Migration

- [x] 1.1 Update the `UserRole` enum in `prisma/schema.prisma` to include `ADMIN`, `MANAGER`, and `MEMBER`.
- [x] 1.2 Generate and run a database migration/schema push to apply changes.
- [x] 1.3 Update existing user records to map `ORGANIZER` to `ADMIN` in the database.

## 2. Backend Types & Core Auth Update

- [x] 2.1 Update the shared `UserRole` enum in `packages/types/src/organization.ts`.
- [x] 2.2 Rebuild the shared packages to propagate types to the apps.
- [x] 2.3 Update `AuthService` registration logic to default the registering user's role to `ADMIN`.
- [x] 2.4 Update `ActiveOrgGuard` references to the new roles.

## 3. Backend Member Management API

- [x] 3.1 Create `UsersController` at `apps/backend/src/users/users.controller.ts` with listing, creation, and deletion endpoints.
- [x] 3.2 Implement `UsersService` to manage users (with bcrypt hashing for direct provisioning and checks preventing self-deletion).
- [x] 3.3 Register `UsersModule` in `AppModule` and configure authorization guards.

## 4. Backend RBAC Route Access Enforcement

- [x] 4.1 Apply `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)` to customization and theme settings.
- [x] 4.2 Apply `@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)` to event creation, updates, and deletion endpoints.
- [x] 4.3 Secure form field building, presets, and reordering routes for admins and managers.

## 5. Dashboard UI Role Enforcement & Member Management

- [x] 5.1 Save and parse the logged-in user's role from the JWT token/auth payload in the dashboard client.
- [x] 5.2 Conditionally hide or disable customization, billing, settings, and modification controls for unauthorized roles.
- [x] 5.3 Create a new member management UI view in the organization portal for admins to list, add, and remove users.

## 6. Verification & Build Checks

- [x] 6.1 Validate specifications via `npx openspec validate --specs`.
- [x] 6.2 Verify that the entire monorepo compiles cleanly using `pnpm build`.
