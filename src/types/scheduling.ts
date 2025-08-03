export interface SchedulingSystemConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface SchedulingRequest {
  // Patient Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Appointment Details
  preferredDate?: string;
  preferredTime?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  appointmentType: 'comprehensive' | 'follow-up' | 'emergency' | 'contact-lens-fitting';
  
  // Insurance Information
  insuranceProvider: string;
  insurancePlan?: string;
  memberId?: string;
  groupNumber?: string;
  
  // Referral Information
  referringProvider?: string;
  referralNumber?: string;
  
  // Additional Information
  reasonForVisit?: string;
  symptoms?: string[];
  previousEyeConditions?: string[];
  medications?: string[];
  
  // Attribution & Marketing
  attributionSource: string;
  marketingChannel?: string;
  campaignId?: string;
  
  // Consent & Preferences
  consentToContact: boolean;
  consentToDataProcessing: boolean;
  preferredLanguage: 'en' | 'es';
  communicationPreferences: {
    email: boolean;
    phone: boolean;
    sms: boolean;
  };
  
  // System Metadata
  sourceSystem: 'goto-optical-intake';
  submissionTimestamp: string;
  submissionId: string;
}

export interface SchedulingResponse {
  success: boolean;
  appointmentId?: string;
  confirmationNumber?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: {
    name: string;
    address: string;
    phone: string;
  };
  provider?: {
    name: string;
    specialty: string;
  };
  instructions?: string[];
  errors?: string[];
  warnings?: string[];
  nextSteps?: string[];
}

export interface SchedulingError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export interface SchedulingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
  optionalFields: string[];
}

// Mock scheduling system configuration
export const SCHEDULING_CONFIG: SchedulingSystemConfig = {
  baseUrl: process.env.SCHEDULING_API_URL || 'https://api.scheduleyourexam.com',
  apiKey: process.env.SCHEDULING_API_KEY || 'mock-api-key',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

// Validation rules for scheduling requests
export const SCHEDULING_VALIDATION_RULES = {
  required: [
    'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
    'insuranceProvider', 'consentToContact', 'consentToDataProcessing'
  ],
  optional: [
    'preferredDate', 'preferredTime', 'urgency', 'appointmentType',
    'insurancePlan', 'memberId', 'groupNumber', 'referringProvider',
    'referralNumber', 'reasonForVisit', 'symptoms', 'previousEyeConditions',
    'medications', 'marketingChannel', 'campaignId'
  ],
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Invalid phone number format'
  },
  dateOfBirth: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Date of birth must be in YYYY-MM-DD format'
  }
};

// Appointment type mappings
export const APPOINTMENT_TYPE_MAPPING = {
  'comprehensive': 'COMPREHENSIVE_EXAM',
  'follow-up': 'FOLLOW_UP',
  'emergency': 'EMERGENCY',
  'contact-lens-fitting': 'CONTACT_LENS_FITTING',
  'routine': 'COMPREHENSIVE_EXAM',
  'urgent': 'FOLLOW_UP'
};

// Insurance provider mappings
export const INSURANCE_PROVIDER_MAPPING = {
  'vsp': 'VSP',
  'eyemed': 'EYEMED',
  'spectera': 'SPECTERA',
  'united-healthcare': 'UNITED_HEALTHCARE',
  'aetna': 'AETNA',
  'cigna': 'CIGNA',
  'blue-cross': 'BLUE_CROSS_BLUE_SHIELD',
  'other': 'OTHER'
}; 