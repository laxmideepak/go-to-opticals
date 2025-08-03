import { NotificationService } from '../notifications';
import { replaceTemplateVariables, extractTemplateVariables } from '@/types/notifications';

describe('NotificationService', () => {
  describe('sendNotification', () => {
    it('should send an SMS notification successfully', async () => {
      const request = {
        type: 'sms' as const,
        recipient: {
          phone: '+15551234567',
          name: 'John Doe',
        },
        template: 'satisfactionSurvey' as const,
        data: {
          doctorName: 'Dr. Bruce Goldstick',
          appointmentDate: '2024-01-15',
          appointmentTime: '14:00',
          location: 'GoTo Optical - Main Office',
          surveyUrl: 'https://example.com/survey',
        },
      };

      const response = await NotificationService.sendNotification(request);

      expect(response.success).toBe(true);
      expect(response.status).toBe('sent');
      expect(response.messageId).toBeDefined();
      expect(response.provider).toBe('mock');
      expect(response.cost).toBeDefined();
    });

    it('should send an email notification successfully', async () => {
      const request = {
        type: 'email' as const,
        recipient: {
          email: 'john@example.com',
          name: 'John Doe',
        },
        template: 'appointmentReminder' as const,
        data: {
          doctorName: 'Dr. Bruce Goldstick',
          appointmentDate: '2024-01-15',
          appointmentTime: '14:00',
          location: 'GoTo Optical - Main Office',
        },
      };

      const response = await NotificationService.sendNotification(request);

      expect(response.success).toBe(true);
      expect(response.status).toBe('sent');
      expect(response.messageId).toBeDefined();
      expect(response.provider).toBe('mock');
      expect(response.cost).toBeDefined();
    });

    it('should handle invalid notification requests', async () => {
      const invalidRequest = {
        type: 'sms' as const,
        recipient: {
          // Missing phone number
        },
        template: 'satisfactionSurvey' as const,
        data: {},
      };

      const response = await NotificationService.sendNotification(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.status).toBe('failed');
      expect(response.error).toContain('Phone number required for SMS notifications');
    });
  });

  describe('sendSatisfactionSurvey', () => {
    it('should send satisfaction survey notification', async () => {
      const recipient = {
        email: 'john@example.com',
        name: 'John Doe',
      };

      const appointmentData = {
        appointmentId: 'APT_123456',
        doctorName: 'Dr. Bruce Goldstick',
        appointmentDate: '2024-01-15',
        appointmentTime: '14:00',
        location: 'GoTo Optical - Main Office',
      };

      const response = await NotificationService.sendSatisfactionSurvey(recipient, appointmentData);

      expect(response.success).toBe(true);
      expect(response.status).toBe('sent');
    });
  });

  describe('sendAppointmentReminder', () => {
    it('should send appointment reminder notification', async () => {
      const recipient = {
        phone: '+15551234567',
        name: 'John Doe',
      };

      const appointmentData = {
        appointmentId: 'APT_123456',
        doctorName: 'Dr. Bruce Goldstick',
        appointmentDate: '2024-01-15',
        appointmentTime: '14:00',
        location: 'GoTo Optical - Main Office',
      };

      const response = await NotificationService.sendAppointmentReminder(recipient, appointmentData);

      expect(response.success).toBe(true);
      expect(response.status).toBe('sent');
    });
  });

  describe('sendAppointmentConfirmation', () => {
    it('should send appointment confirmation notification', async () => {
      const recipient = {
        email: 'john@example.com',
        name: 'John Doe',
      };

      const appointmentData = {
        appointmentId: 'APT_123456',
        doctorName: 'Dr. Bruce Goldstick',
        appointmentDate: '2024-01-15',
        appointmentTime: '14:00',
        location: 'GoTo Optical - Main Office',
      };

      const response = await NotificationService.sendAppointmentConfirmation(recipient, appointmentData);

      expect(response.success).toBe(true);
      expect(response.status).toBe('sent');
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification statistics', () => {
      const stats = NotificationService.getNotificationStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('successful');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('totalCost');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byTemplate');
    });
  });

  describe('getNotificationLogs', () => {
    it('should return notification logs', () => {
      const logs = NotificationService.getNotificationLogs(10, 0);

      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('retryFailedNotifications', () => {
    it('should retry failed notifications', async () => {
      const retryCount = await NotificationService.retryFailedNotifications();

      expect(typeof retryCount).toBe('number');
      expect(retryCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Template Functions', () => {
  describe('extractTemplateVariables', () => {
    it('should extract variables from template', () => {
      const template = 'Hi {{name}}, your appointment with {{doctorName}} is on {{appointmentDate}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('name');
      expect(variables).toContain('doctorName');
      expect(variables).toContain('appointmentDate');
      expect(variables.length).toBe(3);
    });

    it('should handle duplicate variables', () => {
      const template = 'Hi {{name}}, {{name}} your appointment is on {{appointmentDate}}';
      const variables = extractTemplateVariables(template);

      expect(variables).toContain('name');
      expect(variables).toContain('appointmentDate');
      expect(variables.length).toBe(2); // Duplicates removed
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace variables with data', () => {
      const template = 'Hi {{name}}, your appointment with {{doctorName}} is on {{appointmentDate}}';
      const data = {
        name: 'John Doe',
        doctorName: 'Dr. Bruce Goldstick',
        appointmentDate: '2024-01-15',
      };

      const result = replaceTemplateVariables(template, data);

      expect(result).toBe('Hi John Doe, your appointment with Dr. Bruce Goldstick is on 2024-01-15');
    });

    it('should keep unmatched variables as-is', () => {
      const template = 'Hi {{name}}, your appointment with {{doctorName}} is on {{appointmentDate}}';
      const data = {
        name: 'John Doe',
        // Missing doctorName and appointmentDate
      };

      const result = replaceTemplateVariables(template, data);

      expect(result).toBe('Hi John Doe, your appointment with {{doctorName}} is on {{appointmentDate}}');
    });
  });
}); 