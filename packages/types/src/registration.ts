export enum RegistrationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum IdentityType {
  EMAIL = 'EMAIL',
}

export interface Registration {
  id: string;
  eventId: string;
  answers: Record<string, any>; // stores responses to template fields
  status?: RegistrationStatus | string;
  identityValue?: string | null;
  identityType?: IdentityType | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
