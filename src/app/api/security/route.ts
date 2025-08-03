import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger, SECURITY_CONFIG } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const logs = AuditLogger.getLogs();
    
    // Calculate security metrics
    const totalLogs = logs.length;
    const successfulLogs = logs.filter(log => log.success).length;
    const failedLogs = totalLogs - successfulLogs;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return logTime > oneHourAgo;
    });

    // Get unique users and IPs
    const uniqueUsers = new Set(logs.map(log => log.userId).filter(Boolean));
    const uniqueIPs = new Set(logs.map(log => log.ipAddress).filter(Boolean));

    // Security status
    const securityStatus = {
      encryption: {
        algorithm: 'AES-256-CBC',
        status: 'active',
        keyLength: 256,
      },
      rateLimiting: {
        status: 'active',
        windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        maxRequests: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
      },
      auditLogging: {
        status: 'active',
        enabled: SECURITY_CONFIG.AUDIT_LOG_ENABLED,
        level: SECURITY_CONFIG.AUDIT_LOG_LEVEL,
      },
      headers: {
        status: 'active',
        csp: true,
        hsts: true,
        xssProtection: true,
        frameOptions: true,
      },
      hipaa: {
        dataEncryption: true,
        auditLogging: true,
        accessControl: true,
        dataValidation: true,
        secureTransmission: true,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalLogs,
          successfulLogs,
          failedLogs,
          recentLogs: recentLogs.length,
          uniqueUsers: uniqueUsers.size,
          uniqueIPs: uniqueIPs.size,
        },
        securityStatus,
        recentActivity: recentLogs.slice(-10).map(log => ({
          timestamp: log.timestamp,
          action: log.action,
          resource: log.resource,
          success: log.success,
          userId: log.userId,
        })),
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching security status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 