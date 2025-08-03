export interface PatientSession {
  session_id: string;
  timestamp: Date;
  attribution_source: string;
  utm_source?: string;
  insurance_id_fk: string;
  doctor_id_fk?: string;
  satisfaction_score?: number;
  comment?: string;
}

export interface Insurance {
  insurance_id: string;
  name: string;
  logo_url: string;
}

export interface Doctor {
  doctor_id: string;
  name: string;
  specialty: string;
}

export interface IntakeFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Attribution
  attributionSource: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Insurance
  insuranceProvider: string;
  insurancePlan?: string;
  
  // Consent
  consentToContact: boolean;
  consentToDataProcessing: boolean;
  
  // Additional Information
  preferredLanguage: 'en' | 'es';
  notes?: string;
}

export type AttributionSource = 
  | 'walk-in'
  | 'meta-facebook-ads'
  | 'instagram-ads'
  | 'whatsapp-business-ads'
  | 'google-ads'
  | 'referral'
  | 'other';

export const ATTRIBUTION_SOURCES: Record<AttributionSource, string> = {
  'walk-in': 'Walk-in',
  'meta-facebook-ads': 'Meta/Facebook Ads',
  'instagram-ads': 'Instagram Ads',
  'whatsapp-business-ads': 'WhatsApp Business Ads',
  'google-ads': 'Google Ads',
  'referral': 'Referral',
  'other': 'Other'
};

export const INSURANCE_PROVIDERS: Insurance[] = [
  { insurance_id: 'vsp', name: 'VSP', logo_url: '/logos/vsp.png' },
  { insurance_id: 'eyemed', name: 'EyeMed', logo_url: '/logos/eyemed.png' },
  { insurance_id: 'spectera', name: 'Spectera', logo_url: '/logos/spectera.png' },
  { insurance_id: 'united-healthcare', name: 'United Healthcare', logo_url: '/logos/uhc.png' },
  { insurance_id: 'aetna', name: 'Aetna', logo_url: '/logos/aetna.png' },
  { insurance_id: 'cigna', name: 'Cigna', logo_url: '/logos/cigna.png' },
  { insurance_id: 'blue-cross', name: 'Blue Cross Blue Shield', logo_url: '/logos/bcbs.png' },
  { insurance_id: 'other', name: 'Other', logo_url: '/logos/other.png' }
]; 