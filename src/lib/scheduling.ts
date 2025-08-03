import { 
  SchedulingRequest, 
  SchedulingResponse, 
  SchedulingError, 
  SchedulingValidationResult,
  SCHEDULING_CONFIG,
  SCHEDULING_VALIDATION_RULES,
  APPOINTMENT_TYPE_MAPPING,
  INSURANCE_PROVIDER_MAPPING
} from '@/types/scheduling';
import { AuditLogger } from './security';

export class SchedulingService {
  private static config = SCHEDULING_CONFIG;

  /**
   * Validate scheduling request data
   */
  static validateRequest(data: any): SchedulingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFields: string[] = [];
    const optionalFields: string[] = [];

    // Check required fields
    for (const field of SCHEDULING_VALIDATION_RULES.required) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      } else {
        requiredFields.push(field);
      }
    }

    // Check optional fields
    for (const field of SCHEDULING_VALIDATION_RULES.optional) {
      if (data[field]) {
        optionalFields.push(field);
      }
    }

    // Validate email format
    if (data.email && !SCHEDULING_VALIDATION_RULES.email.pattern.test(data.email)) {
      errors.push(SCHEDULING_VALIDATION_RULES.email.message);
    }

    // Validate phone format
    if (data.phone) {
      const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
      if (!SCHEDULING_VALIDATION_RULES.phone.pattern.test(cleanPhone)) {
        errors.push(SCHEDULING_VALIDATION_RULES.phone.message);
      }
    }

    // Validate date of birth format
    if (data.dateOfBirth && !SCHEDULING_VALIDATION_RULES.dateOfBirth.pattern.test(data.dateOfBirth)) {
      errors.push(SCHEDULING_VALIDATION_RULES.dateOfBirth.message);
    }

    // Check for potential issues
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 0 || age > 120) {
        warnings.push('Date of birth appears to be invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredFields,
      optionalFields
    };
  }

  /**
   * Transform intake form data to scheduling request format
   */
  static transformIntakeData(intakeData: any): SchedulingRequest {
    return {
      // Patient Information
      firstName: intakeData.firstName,
      lastName: intakeData.lastName,
      email: intakeData.email,
      phone: intakeData.phone,
      dateOfBirth: intakeData.dateOfBirth,
      
      // Appointment Details (defaults)
      urgency: 'routine',
      appointmentType: 'comprehensive',
      
      // Insurance Information
      insuranceProvider: INSURANCE_PROVIDER_MAPPING[intakeData.insuranceProvider] || intakeData.insuranceProvider,
      insurancePlan: intakeData.insurancePlan,
      
      // Attribution & Marketing
      attributionSource: intakeData.attributionSource,
      
      // Consent & Preferences
      consentToContact: intakeData.consentToContact,
      consentToDataProcessing: intakeData.consentToDataProcessing,
      preferredLanguage: intakeData.preferredLanguage || 'en',
      communicationPreferences: {
        email: true,
        phone: true,
        sms: false
      },
      
      // System Metadata
      sourceSystem: 'goto-optical-intake',
      submissionTimestamp: new Date().toISOString(),
      submissionId: intakeData.submissionId || `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Send scheduling request to external system
   */
  static async sendSchedulingRequest(request: SchedulingRequest): Promise<SchedulingResponse> {
    try {
      // Log the scheduling attempt
      AuditLogger.log({
        userId: 'system',
        action: 'SCHEDULE_APPOINTMENT',
        resource: '/api/scheduling',
        details: {
          submissionId: request.submissionId,
          patientName: `${request.firstName} ${request.lastName}`,
          insuranceProvider: request.insuranceProvider,
          appointmentType: request.appointmentType
        },
        success: true
      });

      // In a real implementation, this would make an HTTP request to the scheduling system
      // For now, we'll simulate the API call
      const response = await this.simulateSchedulingAPI(request);
      
      return response;
    } catch (error) {
      const schedulingError: SchedulingError = {
        code: 'SCHEDULING_FAILED',
        message: 'Failed to schedule appointment',
        details: error,
        retryable: true
      };

      // Log the error
      AuditLogger.log({
        userId: 'system',
        action: 'SCHEDULE_APPOINTMENT',
        resource: '/api/scheduling',
        details: {
          submissionId: request.submissionId,
          error: schedulingError
        },
        success: false,
        errorMessage: schedulingError.message
      });

      throw schedulingError;
    }
  }

  /**
   * Simulate the scheduling API call
   */
  private static async simulateSchedulingAPI(request: SchedulingRequest): Promise<SchedulingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different scenarios based on data
    const isUrgent = request.urgency === 'urgent' || request.urgency === 'emergency';
    const hasInsurance = request.insuranceProvider && request.insuranceProvider !== 'other';
    
    if (Math.random() < 0.1) {
      // 10% chance of failure
      throw new Error('Scheduling system temporarily unavailable');
    }

    // Generate mock appointment details
    const appointmentId = `APT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const confirmationNumber = `CONF_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Calculate appointment date (next available slot)
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + (isUrgent ? 1 : 7));
    const scheduledDate = appointmentDate.toISOString().split('T')[0];
    const scheduledTime = isUrgent ? '09:00' : '14:00';

    const response: SchedulingResponse = {
      success: true,
      appointmentId,
      confirmationNumber,
      scheduledDate,
      scheduledTime,
      location: {
        name: 'GoTo Optical - Main Office',
        address: '123 Main Street, Suite 100, Anytown, ST 12345',
        phone: '(555) 123-4567'
      },
      provider: {
        name: 'Dr. Bruce Goldstick',
        specialty: 'Comprehensive Eye Care'
      },
      instructions: [
        'Please arrive 15 minutes before your appointment',
        'Bring your insurance card and photo ID',
        'Bring a list of current medications',
        'If you wear glasses or contacts, bring them with you'
      ],
      nextSteps: [
        'You will receive a confirmation email shortly',
        'Please complete the pre-appointment questionnaire',
        'Call us if you need to reschedule'
      ]
    };

    // Add warnings for missing information
    if (!request.insurancePlan && hasInsurance) {
      response.warnings = ['Insurance plan not specified - may affect coverage'];
    }

    if (!request.reasonForVisit) {
      response.warnings = [...(response.warnings || []), 'Reason for visit not specified'];
    }

    return response;
  }

  /**
   * Retry scheduling request with exponential backoff
   */
  static async retrySchedulingRequest(
    request: SchedulingRequest, 
    attempt: number = 1
  ): Promise<SchedulingResponse> {
    try {
      return await this.sendSchedulingRequest(request);
    } catch (error) {
      if (attempt >= this.config.retryAttempts) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.retrySchedulingRequest(request, attempt + 1);
    }
  }

  /**
   * Get scheduling status for an appointment
   */
  static async getSchedulingStatus(appointmentId: string): Promise<SchedulingResponse> {
    // Simulate status check
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      appointmentId,
      scheduledDate: '2024-01-15',
      scheduledTime: '14:00',
      location: {
        name: 'GoTo Optical - Main Office',
        address: '123 Main Street, Suite 100, Anytown, ST 12345',
        phone: '(555) 123-4567'
      },
      provider: {
        name: 'Dr. Bruce Goldstick',
        specialty: 'Comprehensive Eye Care'
      }
    };
  }
} 