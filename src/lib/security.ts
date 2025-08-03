import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// HIPAA Security Configuration
export const SECURITY_CONFIG = {
  // Encryption settings
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-32-chars',
  ALGORITHM: 'AES-256-CBC',
  
  // Password hashing
  SALT_ROUNDS: 12,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Session security
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-key',
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // Audit logging
  AUDIT_LOG_ENABLED: true,
  AUDIT_LOG_LEVEL: 'info',
};

// Data encryption utilities
export class DataEncryption {
  private static key = SECURITY_CONFIG.ENCRYPTION_KEY;

  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error('Decryption failed - invalid data');
      }
      
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static encryptObject(obj: any): string {
    return this.encrypt(JSON.stringify(obj));
  }

  static decryptObject(encryptedData: string): any {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }
}

// Password hashing utilities
export class PasswordSecurity {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SECURITY_CONFIG.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

// Audit logging
export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  private static logs: AuditLogEntry[] = [];

  static log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    if (!SECURITY_CONFIG.AUDIT_LOG_ENABLED) return;

    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);
    
    // In production, this would be sent to a secure logging service
    console.log('AUDIT LOG:', JSON.stringify(logEntry, null, 2));
  }

  static getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  static getLogsByUser(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  static getLogsByAction(action: string): AuditLogEntry[] {
    return this.logs.filter(log => log.action === action);
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

// HIPAA Data Sanitization
export class DataSanitization {
  static sanitizePHI(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove or mask sensitive fields
    const sensitiveFields = [
      'ssn', 'socialSecurityNumber', 'social_security_number',
      'creditCard', 'credit_card', 'cardNumber',
      'password', 'passwd', 'pwd',
      'token', 'secret', 'key'
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizePHI(sanitized[key]);
      }
    }

    return sanitized;
  }

  static validatePHI(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for required HIPAA fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone number format
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
  max: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// CORS configuration for HIPAA compliance
export const CORS_CONFIG = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
}; 