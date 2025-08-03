import { NextRequest, NextResponse } from 'next/server';
import { PenetrationTestingService } from '@/lib/penetration-testing';
import { AuditLogger } from '@/lib/security';
import { z } from 'zod';

const testConfigSchema = z.object({
  enabledTests: z.array(z.string()).optional(),
  severityThreshold: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  maxDuration: z.number().optional(),
  retryAttempts: z.number().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedConfig = testConfigSchema.parse(body);
    
    const penetrationService = PenetrationTestingService.getInstance();
    
    // Log the penetration testing request
    AuditLogger.log({
      action: 'penetration_testing_started',
      userId: 'admin',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        config: validatedConfig,
        timestamp: new Date().toISOString()
      }
    });
    
    // Run comprehensive penetration testing
    const report = await penetrationService.runComprehensiveTest(validatedConfig);
    
    // Log the completion
    AuditLogger.log({
      action: 'penetration_testing_completed',
      userId: 'admin',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        reportId: report.id,
        testCount: report.tests.length,
        findingCount: report.findings.length,
        riskScore: report.riskScore,
        compliance: report.compliance,
        timestamp: new Date().toISOString()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Penetration testing completed successfully',
      report: {
        id: report.id,
        title: report.title,
        summary: report.summary,
        testCount: report.tests.length,
        findingCount: report.findings.length,
        riskScore: report.riskScore,
        compliance: report.compliance,
        generatedAt: report.generatedAt,
        validUntil: report.validUntil,
        recommendations: report.recommendations
      }
    });
    
  } catch (error) {
    console.error('Penetration testing error:', error);
    
    AuditLogger.log({
      action: 'penetration_testing_error',
      userId: 'admin',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to run penetration testing',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    const penetrationService = PenetrationTestingService.getInstance();
    
    switch (action) {
      case 'metrics':
        const metrics = penetrationService.getMetrics();
        return NextResponse.json({
          success: true,
          metrics
        });
        
      case 'reports':
        const reports = penetrationService.getReports();
        return NextResponse.json({
          success: true,
          reports: reports.map(report => ({
            id: report.id,
            title: report.title,
            summary: report.summary,
            testCount: report.tests.length,
            findingCount: report.findings.length,
            riskScore: report.riskScore,
            compliance: report.compliance,
            generatedAt: report.generatedAt,
            validUntil: report.validUntil
          }))
        });
        
      case 'latest':
        const latestReport = penetrationService.getLatestReport();
        if (!latestReport) {
          return NextResponse.json({
            success: false,
            message: 'No penetration testing reports found'
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          report: {
            id: latestReport.id,
            title: latestReport.title,
            summary: latestReport.summary,
            tests: latestReport.tests,
            findings: latestReport.findings,
            riskScore: latestReport.riskScore,
            compliance: latestReport.compliance,
            generatedAt: latestReport.generatedAt,
            validUntil: latestReport.validUntil,
            recommendations: latestReport.recommendations
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action parameter'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error retrieving penetration testing data:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve penetration testing data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 