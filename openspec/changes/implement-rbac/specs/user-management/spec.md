## Purpose
Defines the specifications for managing team members and their roles within an organization by administrators.

## ADDED Requirements

### Requirement: Member Listing
The system SHALL allow organization administrators to view all registered users belonging to their tenant.

#### Scenario: View Members List
- **WHEN** an authenticated user with `ADMIN` role accesses the organization member management area
- **THEN** the system returns a list of all users linked to their `organizationId`, detailing each user's ID, email, role, and registration date

### Requirement: Direct Member Provisioning
The system SHALL allow organization administrators to create new member accounts by directly defining credentials (email, temporary password) and assigning roles (`ADMIN`, `MANAGER`, or `MEMBER`).

#### Scenario: Successful Member Provisioning
- **WHEN** an admin creates a new user with a unique email address and selects a role of `MANAGER`
- **THEN** the user is created in the database and bound to the admin's `organizationId` with the selected role
- **AND** the password is secure-hashed with bcrypt

#### Scenario: Member Provisioning Fails Due to Existing Email
- **WHEN** an admin attempts to provision a new user with an email address that is already registered on the platform
- **THEN** the system returns a conflict exception stating that a user with this email address already exists

### Requirement: Member Removal
The system SHALL allow organization administrators to remove users from their organization, except for their own account to prevent lockout.

#### Scenario: Successful Member Removal
- **WHEN** an admin deletes a member user account within their organization
- **THEN** the user record is deleted from the database
- **AND** the deleted member can no longer authenticate or access the dashboard

#### Scenario: Member Removal Fails on Self
- **WHEN** an admin attempts to delete their own user account
- **THEN** the system returns a bad request error preventing self-deletion
