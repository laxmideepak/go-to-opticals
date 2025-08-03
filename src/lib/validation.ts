import { z } from 'zod';

export const intakeFormSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(1, { message: 'First name is required' })
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be less than 50 characters' }),
  
  lastName: z.string()
    .min(1, { message: 'Last name is required' })
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be less than 50 characters' }),
  
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  
  phone: z.string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^[\+]?[1-9][\d]{0,15}$/, { 
      message: 'Please enter a valid phone number' 
    }),
  
  dateOfBirth: z.string()
    .min(1, { message: 'Date of birth is required' })
    .refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, { message: 'Please enter a valid date of birth' }),
  
  // Attribution
  attributionSource: z.string()
    .min(1, { message: 'Please select how you heard about us' }),
  
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  
  // Insurance
  insuranceProvider: z.string()
    .min(1, { message: 'Please select your insurance provider' }),
  
  insurancePlan: z.string().optional(),
  
  // Consent
  consentToContact: z.boolean()
    .refine((val) => val === true, { 
      message: 'You must consent to be contacted' 
    }),
  
  consentToDataProcessing: z.boolean()
    .refine((val) => val === true, { 
      message: 'You must consent to data processing' 
    }),
  
  // Additional Information
  preferredLanguage: z.enum(['en', 'es'])
    .default('en'),
  
  notes: z.string().optional()
});

export type IntakeFormSchema = z.infer<typeof intakeFormSchema>;

// Spanish translations for form validation
export const spanishMessages = {
  firstName: {
    required: 'El nombre es obligatorio',
    min: 'El nombre debe tener al menos 2 caracteres',
    max: 'El nombre debe tener menos de 50 caracteres'
  },
  lastName: {
    required: 'El apellido es obligatorio',
    min: 'El apellido debe tener al menos 2 caracteres',
    max: 'El apellido debe tener menos de 50 caracteres'
  },
  email: {
    required: 'El correo electrónico es obligatorio',
    invalid: 'Por favor ingrese un correo electrónico válido'
  },
  phone: {
    required: 'El número de teléfono es obligatorio',
    invalid: 'Por favor ingrese un número de teléfono válido'
  },
  dateOfBirth: {
    required: 'La fecha de nacimiento es obligatoria',
    invalid: 'Por favor ingrese una fecha de nacimiento válida'
  },
  attributionSource: {
    required: 'Por favor seleccione cómo se enteró de nosotros'
  },
  insuranceProvider: {
    required: 'Por favor seleccione su proveedor de seguro'
  },
  consentToContact: {
    required: 'Debe consentir ser contactado'
  },
  consentToDataProcessing: {
    required: 'Debe consentir el procesamiento de datos'
  }
}; 