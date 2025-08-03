import {
  NotificationType,
  NotificationStatus,
  NotificationRequest,
  NotificationResponse,
  NotificationLog,
  NotificationPreferences,
  NOTIFICATION_CONFIG,
  replaceTemplateVariables,
  extractTemplateVariables,
} from '@/types/notifications';
import { AuditLogger } from './security';

// Store notification logs for demo purposes
let notificationLogs: NotificationLog[] = [];
let notificationPreferences: Map<string, NotificationPreferences> = new Map();

export class NotificationService {
  private static config = NOTIFICATION_CONFIG;

  /**
   * Send a notification (SMS or Email)
   */
  static async sendNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      // Validate the request
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        throw new Error(`Invalid notification request: ${validation.errors.join(', ')}`);
      }

      // Check user preferences
      const preferences = await this.getUserPreferences(request.recipient.email || request.recipient.phone || '');
      if (!this.shouldSendNotification(request, preferences)) {
        return {
          success: false,
          status: 'failed',
          error: 'Notification blocked by user preferences',
        };
      }

      // Get template and replace variables
      const template = this.getTemplate(request.template, request.type);
      const content = replaceTemplateVariables(template, request.data);

      // Send based on type
      let response: NotificationResponse;
      if (request.type === 'sms') {
        response = await this.sendSMS(request.recipient.phone!, content);
      } else {
        response = await this.sendEmail(request.recipient.email!, content, request.template);
      }

      // Log the notification
      const logEntry: NotificationLog = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: request.type,
        recipient: request.recipient.email || request.recipient.phone || '',
        template: request.template,
        status: response.status,
        messageId: response.messageId,
        provider: response.provider,
        error: response.error,
        cost: response.cost,
        sentAt: new Date(),
        retryCount: 0,
        metadata: {
          appointmentId: request.data.appointmentId,
          doctorName: request.data.doctorName,
          priority: request.priority,
        },
      };

      notificationLogs.push(logEntry);

      // Audit log the notification
      AuditLogger.log({
        userId: 'system',
        action: 'SEND_NOTIFICATION',
        resource: `/api/notifications/${request.type}`,
        details: {
          notificationId: logEntry.id,
          recipient: logEntry.recipient,
          template: request.template,
          status: response.status,
          cost: response.cost,
        },
        success: response.success,
        errorMessage: response.error,
      });

      return response;
    } catch (error) {
      console.error('Notification error:', error);
      
      const errorResponse: NotificationResponse = {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Log the error
      AuditLogger.log({
        userId: 'system',
        action: 'SEND_NOTIFICATION',
        resource: `/api/notifications/${request.type}`,
        details: { error: errorResponse.error },
        success: false,
        errorMessage: errorResponse.error,
      });

      return errorResponse;
    }
  }

  /**
   * Send satisfaction survey notification
   */
  static async sendSatisfactionSurvey(
    recipient: { email?: string; phone?: string; name?: string },
    appointmentData: {
      appointmentId: string;
      doctorName: string;
      appointmentDate: string;
      appointmentTime: string;
      location: string;
    }
  ): Promise<NotificationResponse> {
    const surveyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/satisfaction?appointmentId=${appointmentData.appointmentId}`;
    
    const request: NotificationRequest = {
      type: recipient.email ? 'email' : 'sms',
      recipient,
      template: 'satisfactionSurvey',
      data: {
        ...appointmentData,
        surveyUrl,
      },
      priority: 'normal',
    };

    return this.sendNotification(request);
  }

  /**
   * Send appointment reminder
   */
  static async sendAppointmentReminder(
    recipient: { email?: string; phone?: string; name?: string },
    appointmentData: {
      appointmentId: string;
      doctorName: string;
      appointmentDate: string;
      appointmentTime: string;
      location: string;
    }
  ): Promise<NotificationResponse> {
    const request: NotificationRequest = {
      type: recipient.email ? 'email' : 'sms',
      recipient,
      template: 'appointmentReminder',
      data: appointmentData,
      priority: 'high',
    };

    return this.sendNotification(request);
  }

  /**
   * Send appointment confirmation
   */
  static async sendAppointmentConfirmation(
    recipient: { email?: string; phone?: string; name?: string },
    appointmentData: {
      appointmentId: string;
      doctorName: string;
      appointmentDate: string;
      appointmentTime: string;
      location: string;
    }
  ): Promise<NotificationResponse> {
    const request: NotificationRequest = {
      type: recipient.email ? 'email' : 'sms',
      recipient,
      template: 'appointmentConfirmation',
      data: appointmentData,
      priority: 'normal',
    };

    return this.sendNotification(request);
  }

  /**
   * Validate notification request
   */
  private static validateRequest(request: NotificationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.type || !['sms', 'email'].includes(request.type)) {
      errors.push('Invalid notification type');
    }

    if (request.type === 'sms' && !request.recipient.phone) {
      errors.push('Phone number required for SMS notifications');
    }

    if (request.type === 'email' && !request.recipient.email) {
      errors.push('Email address required for email notifications');
    }

    if (!request.template || !['satisfactionSurvey', 'appointmentReminder', 'appointmentConfirmation'].includes(request.template)) {
      errors.push('Invalid template');
    }

    if (!request.data) {
      errors.push('Notification data required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get template content
   */
  private static getTemplate(templateName: string, type: NotificationType): string {
    const template = this.config.templates[templateName as keyof typeof this.config.templates];
    
    if (type === 'sms') {
      return template.sms;
    } else {
      return template.email.text; // Use text version for email
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMS(phone: string, content: string): Promise<NotificationResponse> {
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate occasional failures
    if (Math.random() < 0.05) {
      return {
        success: false,
        status: 'failed',
        error: 'SMS delivery failed',
        provider: this.config.sms.provider,
      };
    }

    return {
      success: true,
      status: 'sent',
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      provider: this.config.sms.provider,
      deliveryTime: new Date(),
      cost: 0.01, // Mock cost
    };
  }

  /**
   * Send email notification
   */
  private static async sendEmail(email: string, content: string, templateName: string): Promise<NotificationResponse> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate occasional failures
    if (Math.random() < 0.03) {
      return {
        success: false,
        status: 'failed',
        error: 'Email delivery failed',
        provider: this.config.email.provider,
      };
    }

    return {
      success: true,
      status: 'sent',
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      provider: this.config.email.provider,
      deliveryTime: new Date(),
      cost: 0.001, // Mock cost
    };
  }

  /**
   * Get user notification preferences
   */
  private static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // In a real app, this would fetch from database
    const defaultPreferences: NotificationPreferences = {
      userId,
      email: true,
      sms: true,
      appointmentReminders: true,
      satisfactionSurveys: true,
      marketing: false,
      timezone: 'America/New_York',
      language: 'en',
    };

    return notificationPreferences.get(userId) || defaultPreferences;
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private static shouldSendNotification(request: NotificationRequest, preferences: NotificationPreferences): boolean {
    // Check if user has opted out of this type of notification
    if (request.type === 'email' && !preferences.email) {
      return false;
    }

    if (request.type === 'sms' && !preferences.sms) {
      return false;
    }

    // Check specific notification types
    if (request.template === 'satisfactionSurvey' && !preferences.satisfactionSurveys) {
      return false;
    }

    if (request.template === 'appointmentReminder' && !preferences.appointmentReminders) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: preferences.quietHours.timezone 
      });
      
      if (currentTime >= preferences.quietHours.start && currentTime <= preferences.quietHours.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get notification logs
   */
  static getNotificationLogs(limit: number = 50, offset: number = 0): NotificationLog[] {
    return notificationLogs
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Get notification statistics
   */
  static getNotificationStats() {
    const total = notificationLogs.length;
    const successful = notificationLogs.filter(log => log.status === 'sent' || log.status === 'delivered').length;
    const failed = notificationLogs.filter(log => log.status === 'failed').length;
    const pending = notificationLogs.filter(log => log.status === 'pending').length;
    
    const totalCost = notificationLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    
    const byType = {
      sms: notificationLogs.filter(log => log.type === 'sms').length,
      email: notificationLogs.filter(log => log.type === 'email').length,
    };

    const byTemplate = {
      satisfactionSurvey: notificationLogs.filter(log => log.template === 'satisfactionSurvey').length,
      appointmentReminder: notificationLogs.filter(log => log.template === 'appointmentReminder').length,
      appointmentConfirmation: notificationLogs.filter(log => log.template === 'appointmentConfirmation').length,
    };

    return {
      total,
      successful,
      failed,
      pending,
      totalCost,
      byType,
      byTemplate,
    };
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const existing = await this.getUserPreferences(userId);
    const updated = { ...existing, ...preferences, userId };
    notificationPreferences.set(userId, updated);
  }

  /**
   * Retry failed notifications
   */
  static async retryFailedNotifications(): Promise<number> {
    const failedLogs = notificationLogs.filter(log => log.status === 'failed' && log.retryCount < 3);
    let retryCount = 0;

    for (const log of failedLogs) {
      try {
        // Reconstruct the original request (simplified)
        const request: NotificationRequest = {
          type: log.type as NotificationType,
          recipient: {
            [log.type === 'sms' ? 'phone' : 'email']: log.recipient,
          },
          template: log.template as any,
          data: log.metadata || {},
        };

        const response = await this.sendNotification(request);
        
        if (response.success) {
          log.status = 'sent';
          log.retryCount++;
          retryCount++;
        }
      } catch (error) {
        console.error('Retry failed for notification:', log.id, error);
      }
    }

    return retryCount;
  }
} 