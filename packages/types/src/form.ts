export enum FormTemplateId {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  GAMING_TOURNAMENT = 'GAMING_TOURNAMENT',
  WORKSHOP = 'WORKSHOP',
  HACKATHON = 'HACKATHON',
}

export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[]; // for select/radio options
  placeholder?: string;
}

export interface FormTemplate {
  id: FormTemplateId;
  name: string;
  description: string;
  fields: FormField[];
}
