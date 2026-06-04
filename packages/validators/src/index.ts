export interface ValidatorFormField {
  id?: string;
  name?: string;
  label: string;
  type: string;
  required: boolean;
  options?: any;
  placeholder?: string | null;
}

export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a form response object against a list of FormField definitions.
 * Zero-dependency, lightweight, and tree-shakeable.
 */
export function validateForm(
  answers: Record<string, any>,
  fields: ValidatorFormField[],
  keyToValidateBy: 'id' | 'name' = 'name'
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const fieldKey = keyToValidateBy === 'id' ? field.id : field.name;
    if (!fieldKey) {
      continue;
    }

    const value = answers[fieldKey];
    const fType = String(field.type).toUpperCase();

    // 1. Required Check
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (fType === 'CHECKBOX' && field.required) {
      if (value !== 'on' && value !== true && value !== 'true') {
        errors[fieldKey] = `"${field.label}" must be checked.`;
        continue;
      }
    } else if (field.required && isEmpty) {
      errors[fieldKey] = `"${field.label}" is required.`;
      continue;
    }

    // Skip further checks if the field is empty and not required
    if (isEmpty) {
      continue;
    }

    // 2. Email Validation
    if (fType === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof value !== 'string' || !emailRegex.test(value.trim())) {
        errors[fieldKey] = `"${field.label}" must be a valid email address.`;
      }
    }

    // 3. Number Validation
    if (fType === 'NUMBER') {
      const parsedNum = Number(value);
      if (isNaN(parsedNum)) {
        errors[fieldKey] = `"${field.label}" must be a valid number.`;
      }
    }

    // 4. Select / Radio Option Validation
    if (fType === 'SELECT' || fType === 'RADIO') {
      let allowedOptions: string[] = [];
      if (field.options) {
        try {
          if (typeof field.options === 'string') {
            allowedOptions = JSON.parse(field.options);
          } else if (Array.isArray(field.options)) {
            allowedOptions = field.options;
          }
        } catch {
          allowedOptions = [];
        }
      }
      if (!allowedOptions.includes(value)) {
        errors[fieldKey] = `Invalid option selected for "${field.label}".`;
      }
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

