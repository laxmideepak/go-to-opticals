import { PenetrationTestingService } from '../penetration-testing';
import { HIPAA_REQUIREMENTS, SOC2_CRITERIA, GDPR_REQUIREMENTS } from '../../types/security';

describe('PenetrationTestingService', () => {
  let service: PenetrationTestingService;

  beforeEach(() => {
    service = PenetrationTestingService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = PenetrationTestingService.getInstance();
      const instance2 = PenetrationTestingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('runComprehensiveTest', () => {
    it('should run comprehensive penetration testing', async () => {
      const report = await service.runComprehensiveTest();
      
      expect(report).toBeDefined();
      expect(report.id).toMatch(/^pen-test-\d+$/);
      expect(report.title).toBe('Comprehensive Security Penetration Test Report');
      expect(report.tests.length).toBeGreaterThan(0);
      expect(report.riskScore).toBeGreaterThanOrEqual(0);
      expect(report.riskScore).toBeLessThanOrEqual(100);
      expect(report.compliance).toBeDefined();
      expect(report.compliance.hipaa).toBeDefined();
      expect(report.compliance.soc2).toBeDefined();
      expect(report.compliance.gdpr).toBeDefined();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should run with custom configuration', async () => {
      const config = {
        enabledTests: ['authentication', 'authorization'],
        severityThreshold: 'high' as const,
        maxDuration: 10000,
        retryAttempts: 2
      };

      const report = await service.runComprehensiveTest(config);
      
      expect(report).toBeDefined();
      expect(report.tests.length).toBeGreaterThan(0);
    });
  });

  describe('test categories', () => {
    it('should run authentication tests', async () => {
      const tests = await (service as any).runAuthenticationTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('authentication');
      expect(tests[0].severity).toBeDefined();
      expect(tests[0].result).toBeDefined();
    });

    it('should run authorization tests', async () => {
      const tests = await (service as any).runAuthorizationTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('authorization');
    });

    it('should run data encryption tests', async () => {
      const tests = await (service as any).runDataEncryptionTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('data_encryption');
    });

    it('should run input validation tests', async () => {
      const tests = await (service as any).runInputValidationTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('input_validation');
    });

    it('should run session management tests', async () => {
      const tests = await (service as any).runSessionManagementTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('session_management');
    });

    it('should run API security tests', async () => {
      const tests = await (service as any).runApiSecurityTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('api_security');
    });

    it('should run SQL injection tests', async () => {
      const tests = await (service as any).runSqlInjectionTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('sql_injection');
    });

    it('should run XSS tests', async () => {
      const tests = await (service as any).runXssTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('xss');
    });

    it('should run CSRF tests', async () => {
      const tests = await (service as any).runCsrfTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('csrf');
    });

    it('should run headers security tests', async () => {
      const tests = await (service as any).runHeadersSecurityTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('headers_security');
    });

    it('should run audit logging tests', async () => {
      const tests = await (service as any).runAuditLoggingTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('audit_logging');
    });

    it('should run rate limiting tests', async () => {
      const tests = await (service as any).runRateLimitingTests({});
      
      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].category).toBe('rate_limiting');
    });
  });

  describe('compliance assessment', () => {
    it('should assess HIPAA compliance', async () => {
      const findings: any[] = [];
      const compliance = await (service as any).assessCompliance(findings);
      
      expect(compliance.hipaa).toBe('compliant');
      expect(compliance.soc2).toBe('compliant');
      expect(compliance.gdpr).toBe('compliant');
      expect(compliance.overall).toBe('compliant');
    });

    it('should assess compliance with critical findings', async () => {
      const findings = [
        {
          severity: 'critical',
          title: 'Critical Security Issue',
          description: 'A critical security vulnerability'
        }
      ];
      
      const compliance = await (service as any).assessCompliance(findings);
      
      expect(compliance.hipaa).toBe('partially_compliant');
      expect(compliance.soc2).toBe('partially_compliant');
      expect(compliance.gdpr).toBe('partially_compliant');
      expect(compliance.overall).toBe('partially_compliant');
    });
  });

  describe('risk score calculation', () => {
    it('should calculate risk score with no findings', () => {
      const findings: any[] = [];
      const score = (service as any).calculateRiskScore(findings);
      
      expect(score).toBe(100);
    });

    it('should calculate risk score with findings', () => {
      const findings = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'medium' }
      ];
      
      const score = (service as any).calculateRiskScore(findings);
      
      expect(score).toBe(50); // 100 - 25 - 15 - 10
    });

    it('should not return negative risk score', () => {
      const findings = [
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' },
        { severity: 'critical' }
      ];
      
      const score = (service as any).calculateRiskScore(findings);
      
      expect(score).toBe(0);
    });
  });

  describe('recommendations generation', () => {
    it('should generate recommendations', () => {
      const findings: any[] = [];
      const compliance = {
        hipaa: 'compliant',
        soc2: 'compliant',
        gdpr: 'compliant',
        overall: 'compliant'
      };
      
      const recommendations = (service as any).generateRecommendations(findings, compliance);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Implement regular security training for all staff');
      expect(recommendations).toContain('Conduct quarterly penetration testing');
    });

    it('should include compliance-specific recommendations', () => {
      const findings: any[] = [];
      const compliance = {
        hipaa: 'partially_compliant',
        soc2: 'compliant',
        gdpr: 'compliant',
        overall: 'partially_compliant'
      };
      
      const recommendations = (service as any).generateRecommendations(findings, compliance);
      
      expect(recommendations).toContain('Strengthen HIPAA compliance measures');
    });
  });

  describe('metrics', () => {
    it('should return metrics', () => {
      const metrics = service.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalTests).toBeGreaterThanOrEqual(0);
      expect(metrics.passedTests).toBeGreaterThanOrEqual(0);
      expect(metrics.failedTests).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeLessThanOrEqual(100);
      expect(metrics.complianceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.complianceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('reports', () => {
    it('should return reports', () => {
      const reports = service.getReports();
      
      expect(Array.isArray(reports)).toBe(true);
    });

    it('should return latest report', async () => {
      // Run a test to generate a report
      await service.runComprehensiveTest();
      
      const latestReport = service.getLatestReport();
      
      expect(latestReport).toBeDefined();
      expect(latestReport?.id).toMatch(/^pen-test-\d+$/);
    });
  });

  describe('compliance requirements', () => {
    it('should have HIPAA requirements defined', () => {
      expect(HIPAA_REQUIREMENTS.ACCESS_CONTROL).toBeDefined();
      expect(HIPAA_REQUIREMENTS.AUDIT_CONTROLS).toBeDefined();
      expect(HIPAA_REQUIREMENTS.INTEGRITY).toBeDefined();
      expect(HIPAA_REQUIREMENTS.TRANSMISSION_SECURITY).toBeDefined();
    });

    it('should have SOC 2 criteria defined', () => {
      expect(SOC2_CRITERIA.SECURITY).toBeDefined();
      expect(SOC2_CRITERIA.AVAILABILITY).toBeDefined();
      expect(SOC2_CRITERIA.PROCESSING_INTEGRITY).toBeDefined();
      expect(SOC2_CRITERIA.CONFIDENTIALITY).toBeDefined();
      expect(SOC2_CRITERIA.PRIVACY).toBeDefined();
    });

    it('should have GDPR requirements defined', () => {
      expect(GDPR_REQUIREMENTS.DATA_PROTECTION).toBeDefined();
      expect(GDPR_REQUIREMENTS.CONSENT).toBeDefined();
      expect(GDPR_REQUIREMENTS.RIGHTS).toBeDefined();
      expect(GDPR_REQUIREMENTS.BREACH_NOTIFICATION).toBeDefined();
    });
  });
}); 