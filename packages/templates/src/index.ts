import { FormTemplate, FormTemplateId } from '@eventflow/types';

export const FORM_TEMPLATES: Record<FormTemplateId, FormTemplate> = {
  [FormTemplateId.INDIVIDUAL]: {
    id: FormTemplateId.INDIVIDUAL,
    name: 'Individual Registration',
    description: 'Standard individual event registration form.',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'you@example.com',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        required: true,
        placeholder: '+1 (555) 000-0000',
      },
      {
        name: 'institution',
        label: 'Organization / Institution',
        type: 'text',
        required: false,
        placeholder: 'College, company, or community',
      },
    ],
  },
  [FormTemplateId.TEAM]: {
    id: FormTemplateId.TEAM,
    name: 'Team Registration',
    description: 'Registration form for events with teams.',
    fields: [
      {
        name: 'teamName',
        label: 'Team Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your team name',
      },
      {
        name: 'leaderName',
        label: 'Team Leader Name',
        type: 'text',
        required: true,
        placeholder: 'Full name of team leader',
      },
      {
        name: 'leaderEmail',
        label: 'Team Leader Email',
        type: 'email',
        required: true,
        placeholder: 'leader@example.com',
      },
      {
        name: 'teamSize',
        label: 'Team Size',
        type: 'number',
        required: true,
        placeholder: 'Number of members (e.g., 4)',
      },
      {
        name: 'members',
        label: 'Other Member Names & Emails',
        type: 'textarea',
        required: false,
        placeholder: 'List other members (name, email, role) - one per line',
      },
    ],
  },
  [FormTemplateId.GAMING_TOURNAMENT]: {
    id: FormTemplateId.GAMING_TOURNAMENT,
    name: 'Gaming Tournament Registration',
    description: 'Custom tournament template for gamers and esports.',
    fields: [
      {
        name: 'ign',
        label: 'In-Game Name (IGN) / Alias',
        type: 'text',
        required: true,
        placeholder: 'e.g., Faker, Shroud',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'you@example.com',
      },
      {
        name: 'discord',
        label: 'Discord Username / ID',
        type: 'text',
        required: true,
        placeholder: 'username or username#0000',
      },
      {
        name: 'platform',
        label: 'Gaming Platform',
        type: 'select',
        required: true,
        options: ['PC', 'Console', 'Mobile', 'Nintendo Switch'],
        placeholder: 'Select your platform',
      },
    ],
  },
  [FormTemplateId.WORKSHOP]: {
    id: FormTemplateId.WORKSHOP,
    name: 'Workshop Registration',
    description: 'Registration for educational and hands-on workshops.',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'you@example.com',
      },
      {
        name: 'experience',
        label: 'Experience Level',
        type: 'select',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced'],
        placeholder: 'Select experience level',
      },
      {
        name: 'motivation',
        label: 'What do you hope to learn?',
        type: 'textarea',
        required: false,
        placeholder: 'Briefly tell us what you want to get out of this workshop',
      },
    ],
  },
  [FormTemplateId.HACKATHON]: {
    id: FormTemplateId.HACKATHON,
    name: 'Hackathon Registration',
    description: 'Full-featured application form for tech hackathons.',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'you@example.com',
      },
      {
        name: 'github',
        label: 'GitHub Profile URL',
        type: 'text',
        required: true,
        placeholder: 'https://github.com/username',
      },
      {
        name: 'portfolio',
        label: 'Portfolio / LinkedIn URL',
        type: 'text',
        required: false,
        placeholder: 'https://linkedin.com/in/username or website',
      },
      {
        name: 'tshirt',
        label: 'T-Shirt Size',
        type: 'select',
        required: true,
        options: ['S', 'M', 'L', 'XL', 'XXL'],
        placeholder: 'Select size',
      },
      {
        name: 'skills',
        label: 'Skills / Technical Stack',
        type: 'textarea',
        required: false,
        placeholder: 'React, Node, Python, design, etc.',
      },
    ],
  },
};

export function getTemplate(id: FormTemplateId): FormTemplate {
  const template = FORM_TEMPLATES[id];
  if (!template) {
    throw new Error(`Template with id "${id}" not found.`);
  }
  return template;
}
