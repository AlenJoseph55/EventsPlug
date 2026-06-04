export interface Registration {
  id: string;
  eventId: string;
  answers: Record<string, any>; // stores responses to template fields
  createdAt: Date | string;
}
