export interface PenetrationTest {
  id: string;
  name: string;
  description: string;
  category: SecurityTestCategory;
  severity: SecuritySeverity;
  status: TestStatus;
  result: TestResult;
  findings: SecurityFinding[];
  recommendations: string[];
  timestamp: Date;
  duration: number;
  tester: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  category: SecurityTestCategory;
  cweId?: string;
  cvssScore?: number;
  affectedComponent: string;
  stepsToReproduce: string[];
  impact: string;
  remediation: string;
  status: FindingStatus;
  discoveredAt: Date;
  resolvedAt?: Date;
}

export interface SecurityReport {
  id: string;
  title: string;
  summary: string;
  tests: PenetrationTest[];
  findings: SecurityFinding[];
  compliance: ComplianceStatus;
  riskScore: number;
  generatedAt: Date;
  validUntil: Date;
  recommendations: string[];
}

export interface ComplianceStatus {
  hipaa: ComplianceLevel;
  soc2: ComplianceLevel;
  gdpr: ComplianceLevel;
  overall: ComplianceLevel;
  details: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warning';
      description: string;
      requirements: string[];
    };
  };
}

export type SecurityTestCategory = 
  | 'authentication'
  | 'authorization'
  | 'data_encryption'
  | 'input_validation'
  | 'session_management'
  | 'api_security'
  | 'sql_injection'
  | 'xss'
  | 'csrf'
  | 'file_upload'
  | 'error_handling'
  | 'audit_logging'
  | 'rate_limiting'
  | 'ssl_tls'
  | 'headers_security';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type TestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export type TestResult = 'pass' | 'fail' | 'warning' | 'error';

export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'false_positive';

export type ComplianceLevel = 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';

export interface SecurityMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  complianceScore: number;
  riskScore: number;
  lastUpdated: Date;
}

export interface TestConfiguration {
  enabledTests: SecurityTestCategory[];
  severityThreshold: SecuritySeverity;
  maxDuration: number;
  retryAttempts: number;
  customHeaders?: Record<string, string>;
  testData?: Record<string, any>;
}

// HIPAA Security Rule Requirements
export const HIPAA_REQUIREMENTS = {
  ACCESS_CONTROL: {
    id: '164.312(a)(1)',
    title: 'Access Control',
    description: 'Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights.',
    requirements: [
      'Unique user identification',
      'Emergency access procedure',
      'Automatic logoff',
      'Encryption and decryption'
    ]
  },
  AUDIT_CONTROLS: {
    id: '164.312(b)',
    title: 'Audit Controls',
    description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information.',
    requirements: [
      'Comprehensive audit logging',
      'Log integrity protection',
      'Log retention policies',
      'Audit log review procedures'
    ]
  },
  INTEGRITY: {
    id: '164.312(c)(1)',
    title: 'Integrity',
    description: 'Implement policies and procedures to protect electronic protected health information from improper alteration or destruction.',
    requirements: [
      'Data integrity validation',
      'Tamper detection',
      'Secure transmission protocols',
      'Backup and recovery procedures'
    ]
  },
  TRANSMISSION_SECURITY: {
    id: '164.312(e)(1)',
    title: 'Transmission Security',
    description: 'Implement technical security measures to guard against unauthorized access to electronic protected health information that is being transmitted over an electronic communications network.',
    requirements: [
      'Encryption in transit',
      'Integrity controls',
      'Secure transmission protocols',
      'Access controls for transmission'
    ]
  }
};

// SOC 2 Trust Services Criteria
export const SOC2_CRITERIA = {
  SECURITY: {
    title: 'Security',
    description: 'The system is protected against unauthorized access, use, or modification.',
    requirements: [
      'Access controls',
      'Network security',
      'Application security',
      'Data encryption'
    ]
  },
  AVAILABILITY: {
    title: 'Availability',
    description: 'The system is available for operation and use as committed or agreed.',
    requirements: [
      'System monitoring',
      'Backup procedures',
      'Disaster recovery',
      'Performance monitoring'
    ]
  },
  PROCESSING_INTEGRITY: {
    title: 'Processing Integrity',
    description: 'System processing is complete, accurate, timely, and authorized.',
    requirements: [
      'Data validation',
      'Error handling',
      'Processing controls',
      'Audit trails'
    ]
  },
  CONFIDENTIALITY: {
    title: 'Confidentiality',
    description: 'Information designated as confidential is protected as committed or agreed.',
    requirements: [
      'Data classification',
      'Encryption at rest',
      'Access controls',
      'Data retention policies'
    ]
  },
  PRIVACY: {
    title: 'Privacy',
    description: 'Personal information is collected, used, retained, disclosed, and disposed of in conformity with the commitments in the entity\'s privacy notice.',
    requirements: [
      'Data minimization',
      'Consent management',
      'Data retention',
      'Privacy controls'
    ]
  }
};

// GDPR Requirements
export const GDPR_REQUIREMENTS = {
  DATA_PROTECTION: {
    title: 'Data Protection by Design and by Default',
    description: 'Implement appropriate technical and organizational measures to ensure data protection.',
    requirements: [
      'Privacy by design',
      'Data minimization',
      'Purpose limitation',
      'Storage limitation'
    ]
  },
  CONSENT: {
    title: 'Consent Management',
    description: 'Ensure that consent is freely given, specific, informed, and unambiguous.',
    requirements: [
      'Clear consent mechanisms',
      'Withdrawal procedures',
      'Consent records',
      'Granular consent options'
    ]
  },
  RIGHTS: {
    title: 'Data Subject Rights',
    description: 'Implement procedures to respond to data subject rights requests.',
    requirements: [
      'Right to access',
      'Right to rectification',
      'Right to erasure',
      'Right to portability'
    ]
  },
  BREACH_NOTIFICATION: {
    title: 'Breach Notification',
    description: 'Implement procedures for detecting and reporting personal data breaches.',
    requirements: [
      'Breach detection',
      'Notification procedures',
      'Documentation requirements',
      'Timeline compliance'
    ]
  }
}; 