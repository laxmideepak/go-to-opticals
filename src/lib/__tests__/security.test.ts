import { DataEncryption, PasswordSecurity, AuditLogger, DataSanitization } from '../security';

describe('Security Utilities', () => {
  describe('DataEncryption', () => {
    it('should encrypt and decrypt string data', () => {
      const testData = 'sensitive patient information';
      const encrypted = DataEncryption.encrypt(testData);
      const decrypted = DataEncryption.decrypt(encrypted);
      
      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });

    it('should encrypt and decrypt object data', () => {
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        ssn: '123-45-6789'
      };
      
      const encrypted = DataEncryption.encryptObject(testData);
      const decrypted = DataEncryption.decryptObject(encrypted);
      
      expect(encrypted).not.toBe(JSON.stringify(testData));
      expect(decrypted).toEqual(testData);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        DataEncryption.decrypt('invalid-encrypted-data');
      }).toThrow('Failed to decrypt data');
    });
  });

  describe('PasswordSecurity', () => {
    it('should hash and verify passwords', async () => {
      const password = 'securePassword123';
      const hash = await PasswordSecurity.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(await PasswordSecurity.verifyPassword(password, hash)).toBe(true);
      expect(await PasswordSecurity.verifyPassword('wrongPassword', hash)).toBe(false);
    });
  });

  describe('AuditLogger', () => {
    beforeEach(() => {
      AuditLogger.clearLogs();
    });

    it('should log audit entries', () => {
      const logEntry = {
        userId: 'test-user',
        action: 'POST',
        resource: '/api/intake',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { test: 'data' },
        success: true,
      };

      AuditLogger.log(logEntry);
      const logs = AuditLogger.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        ...logEntry,
        timestamp: expect.any(String),
      });
    });

    it('should filter logs by user', () => {
      AuditLogger.log({
        userId: 'user1',
        action: 'GET',
        resource: '/api/analytics',
        success: true,
      });
      
      AuditLogger.log({
        userId: 'user2',
        action: 'POST',
        resource: '/api/intake',
        success: true,
      });

      const user1Logs = AuditLogger.getLogsByUser('user1');
      expect(user1Logs).toHaveLength(1);
      expect(user1Logs[0].userId).toBe('user1');
    });

    it('should filter logs by action', () => {
      AuditLogger.log({
        userId: 'user1',
        action: 'GET',
        resource: '/api/analytics',
        success: true,
      });
      
      AuditLogger.log({
        userId: 'user2',
        action: 'POST',
        resource: '/api/intake',
        success: true,
      });

      const postLogs = AuditLogger.getLogsByAction('POST');
      expect(postLogs).toHaveLength(1);
      expect(postLogs[0].action).toBe('POST');
    });
  });

  describe('DataSanitization', () => {
    it('should sanitize sensitive fields', () => {
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        password: 'secret123',
        email: 'john.doe@example.com',
      };

      const sanitized = DataSanitization.sanitizePHI(testData);
      
      expect(sanitized.ssn).toBe('[REDACTED]');
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.firstName).toBe('John');
      expect(sanitized.email).toBe('john.doe@example.com');
    });

    it('should validate PHI data correctly', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
      };

      const validation = DataSanitization.validatePHI(validData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid PHI data', () => {
      const invalidData = {
        firstName: 'John',
        // Missing lastName and dateOfBirth
        email: 'invalid-email',
        phone: 'invalid-phone',
      };

      const validation = DataSanitization.validatePHI(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing required field: lastName');
      expect(validation.errors).toContain('Missing required field: dateOfBirth');
      expect(validation.errors).toContain('Invalid email format');
      expect(validation.errors).toContain('Invalid phone number format');
    });

    it('should handle nested objects', () => {
      const testData = {
        patient: {
          firstName: 'John',
          ssn: '123-45-6789',
          contact: {
            email: 'john@example.com',
            password: 'secret123',
          },
        },
      };

      const sanitized = DataSanitization.sanitizePHI(testData);
      
      expect(sanitized.patient.ssn).toBe('[REDACTED]');
      expect(sanitized.patient.contact.password).toBe('[REDACTED]');
      expect(sanitized.patient.firstName).toBe('John');
      expect(sanitized.patient.contact.email).toBe('john@example.com');
    });
  });
}); 