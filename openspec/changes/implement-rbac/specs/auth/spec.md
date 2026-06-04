## Purpose
Defines authentication, registration, session management, and authorization requirements for organization administrators, members, and super administrators.

## ADDED Requirements

### Requirement: API Access Authorization (RBAC)
The system SHALL intercept incoming API requests and validate that the authenticated user possesses a role that is authorized to perform the requested operation.

#### Scenario: Allowed Access to Organization Customization
- **WHEN** a user with the `ADMIN` role requests to update the organization's custom CSS stylesheets
- **THEN** the system authorizes the request and successfully saves the preferences

#### Scenario: Denied Access to Organization Customization
- **WHEN** a user with the `MANAGER` role requests to update the organization's custom CSS stylesheets
- **THEN** the system blocks the request and returns a forbidden status error

#### Scenario: Allowed Access to Event Management
- **WHEN** a user with the `MANAGER` role requests to create a new event
- **THEN** the system authorizes the request and successfully creates the event

## MODIFIED Requirements

### Requirement: Organizer Registration
The system SHALL allow a new event organizer to sign up, creating a user account with the `ADMIN` role and provisioning a new organization/tenant.

#### Scenario: Successful Registration
- **WHEN** an organizer registers with a unique email and unique organization slug
- **THEN** a new organization is provisioned and a new user is created in a transaction with the `ADMIN` role
- **AND** a valid JWT token is returned along with user and organization metadata

#### Scenario: Registration Fails Due to Existing Email
- **WHEN** an organizer tries to register with an email that is already in use
- **THEN** a conflict exception is thrown stating that a user with this email address already exists

#### Scenario: Registration Fails Due to Existing Organization Slug
- **WHEN** an organizer tries to register with an organization slug that is already taken
- **THEN** a conflict exception is thrown stating that the organization URL slug is already taken

### Requirement: Organizer Login
The system SHALL authenticate registered administrators, managers, and members to grant access to the admin dashboard.

#### Scenario: Successful Login
- **WHEN** a user provides a valid email and matching password
- **THEN** a JWT token is generated and returned with user metadata containing their specific role (`ADMIN`, `MANAGER`, or `MEMBER`) and organization metadata

#### Scenario: Login Fails Due to Invalid Email
- **WHEN** a user tries to login with a non-existent email address
- **THEN** an unauthorized exception is thrown stating "Invalid email or password"

#### Scenario: Login Fails Due to Incorrect Password
- **WHEN** a user provides a correct email but an incorrect password
- **THEN** an unauthorized exception is thrown stating "Invalid email or password"
