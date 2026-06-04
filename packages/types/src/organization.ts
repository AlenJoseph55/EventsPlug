export enum UserRole {
  ORGANIZER = 'ORGANIZER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  status: OrganizationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
