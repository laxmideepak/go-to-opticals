export type NotificationType = 'sms' | 'email';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';

export interface NotificationConfig {
  sms: {
    provider: 'twilio' | 'aws-sns' | 'mock';
    apiKey?: string;
    apiSecret?: string;
    fromNumber?: string;
    webhookUrl?: string;
  };
  email: {
    provider: 'sendgrid' | 'aws-ses' | 'nodemailer' | 'mock';
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
    webhookUrl?: string;
  };
  templates: {
    satisfactionSurvey: {
      sms: string;
      email: {
        subject: string;
        html: string;
        text: string;
      };
    };
    appointmentReminder: {
      sms: string;
      email: {
        subject: string;
        html: string;
        text: string;
      };
    };
    appointmentConfirmation: {
      sms: string;
      email: {
        subject: string;
        html: string;
        text: string;
      };
    };
  };
}

export interface NotificationRequest {
  type: NotificationType;
  recipient: {
    phone?: string;
    email?: string;
    name?: string;
  };
  template: 'satisfactionSurvey' | 'appointmentReminder' | 'appointmentConfirmation';
  data: {
    appointmentId?: string;
    doctorName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    location?: string;
    surveyUrl?: string;
    [key: string]: any;
  };
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
  retryAttempts?: number;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  status: NotificationStatus;
  provider?: string;
  error?: string;
  deliveryTime?: Date;
  cost?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLog {
  id: string;
  type: NotificationType;
  recipient: string;
  template: string;
  status: NotificationStatus;
  messageId?: string;
  provider?: string;
  error?: string;
  cost?: number;
  sentAt: Date;
  deliveredAt?: Date;
  retryCount: number;
  metadata?: any;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  satisfactionSurveys: boolean;
  marketing: boolean;
  timezone: string;
  language: 'en' | 'es';
  quietHours?: {
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
  };
}

// Mock configuration for development
export const NOTIFICATION_CONFIG: NotificationConfig = {
  sms: {
    provider: 'mock',
    fromNumber: '+15551234567',
  },
  email: {
    provider: 'mock',
    fromEmail: 'noreply@gotooptical.com',
    fromName: 'GoTo Optical',
  },
  templates: {
    satisfactionSurvey: {
      sms: 'Hi {{name}}, how was your visit with {{doctorName}}? Rate your experience: {{surveyUrl}} Reply STOP to unsubscribe.',
      email: {
        subject: 'How was your visit with {{doctorName}}?',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">How was your visit?</h2>
            <p>Hi {{name}},</p>
            <p>We hope your appointment with {{doctorName}} went well. Your feedback helps us provide better care.</p>
            <p><strong>Appointment Details:</strong></p>
            <ul>
              <li>Date: {{appointmentDate}}</li>
              <li>Time: {{appointmentTime}}</li>
              <li>Location: {{location}}</li>
            </ul>
            <p><a href="{{surveyUrl}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Rate Your Experience</a></p>
            <p>Thank you for choosing GoTo Optical!</p>
          </div>
        `,
        text: `
          How was your visit?
          
          Hi {{name}},
          
          We hope your appointment with {{doctorName}} went well. Your feedback helps us provide better care.
          
          Appointment Details:
          - Date: {{appointmentDate}}
          - Time: {{appointmentTime}}
          - Location: {{location}}
          
          Rate your experience: {{surveyUrl}}
          
          Thank you for choosing GoTo Optical!
        `,
      },
    },
    appointmentReminder: {
      sms: 'Reminder: You have an appointment with {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}. Location: {{location}}. Reply STOP to unsubscribe.',
      email: {
        subject: 'Appointment Reminder - {{appointmentDate}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Appointment Reminder</h2>
            <p>Hi {{name}},</p>
            <p>This is a friendly reminder about your upcoming appointment.</p>
            <p><strong>Appointment Details:</strong></p>
            <ul>
              <li>Date: {{appointmentDate}}</li>
              <li>Time: {{appointmentTime}}</li>
              <li>Doctor: {{doctorName}}</li>
              <li>Location: {{location}}</li>
            </ul>
            <p>Please arrive 15 minutes before your appointment time.</p>
            <p>If you need to reschedule, please call us at (555) 123-4567.</p>
          </div>
        `,
        text: `
          Appointment Reminder
          
          Hi {{name}},
          
          This is a friendly reminder about your upcoming appointment.
          
          Appointment Details:
          - Date: {{appointmentDate}}
          - Time: {{appointmentTime}}
          - Doctor: {{doctorName}}
          - Location: {{location}}
          
          Please arrive 15 minutes before your appointment time.
          
          If you need to reschedule, please call us at (555) 123-4567.
        `,
      },
    },
    appointmentConfirmation: {
      sms: 'Your appointment with {{doctorName}} has been confirmed for {{appointmentDate}} at {{appointmentTime}}. Location: {{location}}. Confirmation: {{appointmentId}}',
      email: {
        subject: 'Appointment Confirmed - {{appointmentDate}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Appointment Confirmed</h2>
            <p>Hi {{name}},</p>
            <p>Your appointment has been successfully scheduled!</p>
            <p><strong>Appointment Details:</strong></p>
            <ul>
              <li>Date: {{appointmentDate}}</li>
              <li>Time: {{appointmentTime}}</li>
              <li>Doctor: {{doctorName}}</li>
              <li>Location: {{location}}</li>
              <li>Confirmation: {{appointmentId}}</li>
            </ul>
            <p>Please arrive 15 minutes before your appointment time.</p>
            <p>If you need to reschedule, please call us at (555) 123-4567.</p>
          </div>
        `,
        text: `
          Appointment Confirmed
          
          Hi {{name}},
          
          Your appointment has been successfully scheduled!
          
          Appointment Details:
          - Date: {{appointmentDate}}
          - Time: {{appointmentTime}}
          - Doctor: {{doctorName}}
          - Location: {{location}}
          - Confirmation: {{appointmentId}}
          
          Please arrive 15 minutes before your appointment time.
          
          If you need to reschedule, please call us at (555) 123-4567.
        `,
      },
    },
  },
};

// Template variable extraction regex
export const TEMPLATE_VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

// Extract variables from template
export function extractTemplateVariables(template: string): string[] {
  const variables: string[] = [];
  let match;
  
  while ((match = TEMPLATE_VARIABLE_REGEX.exec(template)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

// Replace template variables with actual data
export function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  return template.replace(TEMPLATE_VARIABLE_REGEX, (match, variable) => {
    return data[variable] || match;
  });
} 