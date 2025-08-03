import type { AttributionSource } from '@/types/form';

export interface AttributionData {
  source: AttributionSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
}

// Mapping of UTM sources to attribution sources
const UTM_SOURCE_MAP: Record<string, AttributionSource> = {
  'facebook': 'meta-facebook-ads',
  'instagram': 'instagram-ads',
  'whatsapp': 'whatsapp-business-ads',
  'google': 'google-ads',
  'bing': 'google-ads', // Treat Bing as Google Ads for simplicity
  'yahoo': 'google-ads',
  'referral': 'referral',
  'email': 'referral',
  'direct': 'walk-in',
  'organic': 'walk-in',
  'none': 'walk-in',
};

// Facebook Click ID patterns
const FBCLID_PATTERNS = [
  /^fb\.\d+\.\d+\.\d+$/,
  /^fbclid=/,
];

// Google Click ID patterns
const GCLID_PATTERNS = [
  /^gclid=/,
  /^gclid$/,
];

export function parseAttributionFromURL(url: string): AttributionData {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;
  
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');
  const fbclid = searchParams.get('fbclid');
  const gclid = searchParams.get('gclid');
  
  // Determine attribution source
  let source: AttributionSource = 'walk-in'; // Default fallback
  
  if (utmSource) {
    const normalizedSource = utmSource.toLowerCase();
    source = UTM_SOURCE_MAP[normalizedSource] || 'other';
  } else if (fbclid) {
    source = 'meta-facebook-ads';
  } else if (gclid) {
    source = 'google-ads';
  } else if (utmMedium === 'cpc' || utmMedium === 'ppc') {
    source = 'google-ads';
  } else if (utmMedium === 'social') {
    source = 'meta-facebook-ads';
  } else if (utmMedium === 'email') {
    source = 'referral';
  }
  
  return {
    source,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    fbclid,
    gclid,
  };
}

export function parseAttributionFromReferrer(referrer: string): AttributionData {
  if (!referrer) {
    return { source: 'walk-in' };
  }
  
  try {
    const referrerUrl = new URL(referrer);
    const hostname = referrerUrl.hostname.toLowerCase();
    
    // Map common referrer domains to attribution sources
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return { source: 'meta-facebook-ads' };
    }
    
    if (hostname.includes('instagram.com')) {
      return { source: 'instagram-ads' };
    }
    
    if (hostname.includes('google.com') || hostname.includes('google.co')) {
      return { source: 'google-ads' };
    }
    
    if (hostname.includes('bing.com')) {
      return { source: 'google-ads' };
    }
    
    if (hostname.includes('yahoo.com')) {
      return { source: 'google-ads' };
    }
    
    // Check for UTM parameters in referrer
    const searchParams = referrerUrl.searchParams;
    const utmSource = searchParams.get('utm_source');
    
    if (utmSource) {
      const normalizedSource = utmSource.toLowerCase();
      const source = UTM_SOURCE_MAP[normalizedSource] || 'referral';
      return { source };
    }
    
    // Default to referral for external sites
    return { source: 'referral' };
    
  } catch (error) {
    console.error('Error parsing referrer:', error);
    return { source: 'walk-in' };
  }
}

export function getAttributionDisplayName(source: AttributionSource): string {
  const displayNames: Record<AttributionSource, string> = {
    'walk-in': 'Walk-in',
    'meta-facebook-ads': 'Meta/Facebook Ads',
    'instagram-ads': 'Instagram Ads',
    'whatsapp-business-ads': 'WhatsApp Business Ads',
    'google-ads': 'Google Ads',
    'referral': 'Referral',
    'other': 'Other',
  };
  
  return displayNames[source];
}

export function validateAttributionData(data: AttributionData): boolean {
  // Basic validation
  if (!data.source) {
    return false;
  }
  
  // Validate UTM parameters if present
  if (data.utmSource && data.utmSource.length > 100) {
    return false;
  }
  
  if (data.utmCampaign && data.utmCampaign.length > 100) {
    return false;
  }
  
  return true;
}

export function sanitizeAttributionData(data: AttributionData): AttributionData {
  return {
    ...data,
    utmSource: data.utmSource?.substring(0, 100),
    utmMedium: data.utmMedium?.substring(0, 100),
    utmCampaign: data.utmCampaign?.substring(0, 100),
    utmTerm: data.utmTerm?.substring(0, 100),
    utmContent: data.utmContent?.substring(0, 100),
    fbclid: data.fbclid?.substring(0, 100),
    gclid: data.gclid?.substring(0, 100),
  };
} 