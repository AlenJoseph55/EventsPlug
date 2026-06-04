import { FormTemplateId } from './form';

export interface Event {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description: string;
  date: Date | string;
  location: string;
  posterUrl?: string | null;
  maxRegistrations?: number | null;
  formTemplateId?: any | null;
  customFields?: any | null; // For future extensions/customizations
  formFields?: any[] | null; // Dynamic Relational custom form fields list
  createdAt: Date | string;
  updatedAt: Date | string;
}
