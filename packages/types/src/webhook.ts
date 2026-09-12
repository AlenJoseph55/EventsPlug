export enum WebhookEventType {
  REGISTRATION_CREATED = 'registration.created',
  REGISTRATION_CANCELLED = 'registration.cancelled',
  EVENT_PUBLISHED = 'event.published',
  EVENT_CLOSED = 'event.closed',
}

export interface WebhookEnvelope<T = any> {
  id: string;
  type: WebhookEventType | string;
  createdAt: string;
  data: T;
}
