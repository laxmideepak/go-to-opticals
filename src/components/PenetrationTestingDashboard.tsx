'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Play,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import type { 
  SecurityReport, 
  SecurityMetrics, 
  PenetrationTest,
  SecurityFinding,
  ComplianceStatus
} from '@/types/security';

interface PenetrationTestingDashboardProps {
  className?: string;
}

export default function PenetrationTestingDashboard({ className = '' }: PenetrationTestingDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [latestReport, setLatestReport] = useState<SecurityReport | null>(null);
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load metrics
      const metricsResponse = await fetch('/api/penetration-testing?action=metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Load latest report
      const latestResponse = await fetch('/api/penetration-testing?action=latest');
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        setLatestReport(latestData.report);
      }

      // Load all reports
      const reportsResponse = await fetch('/api/penetration-testing?action=reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports);
      }
    } catch (error) {
      console.error('Error loading penetration testing data:', error);
      setMessage('Failed to load data');
    }
  };

  const runPenetrationTest = async () => {
    setIsRunning(true);
    setMessage('Running comprehensive penetration testing...');
    
    try {
      const response = await fetch('/api/penetration-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabledTests: [
            'authentication',
            'authorization',
            'data_encryption',
            'input_validation',
            'session_management',
            'api_security',
            'sql_injection',
            'xss',
            'csrf',
            'headers_security',
            'audit_logging',
            'rate_limiting'
          ],
          severityThreshold: 'medium',
          maxDuration: 30000,
          retryAttempts: 3
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Penetration testing completed successfully!');
        setLatestReport(result.report);
        await loadData(); // Refresh all data
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error running penetration test:', error);
      setMessage('Failed to run penetration testing');
    } finally {
      setIsRunning(false);
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'partially_compliant': return 'text-yellow-600 bg-yellow-100';
      case 'non_compliant': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Penetration Testing</h1>
            <p className="text-gray-600">Comprehensive security assessment and compliance validation</p>
          </div>
        </div>
        
        <button
          onClick={runPenetrationTest}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Security Test</span>
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tests</p>
                <p className="text-2xl font-bold text-blue-900">{metrics.totalTests}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Passed Tests</p>
                <p className="text-2xl font-bold text-green-900">{metrics.passedTests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskScoreColor(metrics.riskScore)}`}>
                  {metrics.riskScore}/100
                </p>
              </div>
              {metrics.riskScore >= 80 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Compliance</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.complianceScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Latest Report */}
      {latestReport && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Security Report</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Report ID</p>
                <p className="text-lg font-semibold text-gray-900">{latestReport.id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Run</p>
                <p className="text-lg font-semibold text-gray-900">{latestReport.testCount}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Findings</p>
                <p className="text-lg font-semibold text-gray-900">{latestReport.findingCount}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className={`text-lg font-semibold ${getRiskScoreColor(latestReport.riskScore)}`}>
                  {latestReport.riskScore}/100
                </p>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${getComplianceColor(latestReport.compliance.hipaa)}`}>
                  <p className="font-medium">HIPAA</p>
                  <p className="text-sm capitalize">{latestReport.compliance.hipaa.replace('_', ' ')}</p>
                </div>
                
                <div className={`p-3 rounded-lg ${getComplianceColor(latestReport.compliance.soc2)}`}>
                  <p className="font-medium">SOC 2</p>
                  <p className="text-sm capitalize">{latestReport.compliance.soc2.replace('_', ' ')}</p>
                </div>
                
                <div className={`p-3 rounded-lg ${getComplianceColor(latestReport.compliance.gdpr)}`}>
                  <p className="font-medium">GDPR</p>
                  <p className="text-sm capitalize">{latestReport.compliance.gdpr.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-2">
                {latestReport.tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {test.result === 'pass' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(test.severity)}`}>
                        {test.severity}
                      </span>
                      <span className="text-sm text-gray-500">{test.duration}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {latestReport.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {latestReport.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Reports */}
      {reports.length > 1 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Historical Reports</h2>
          <div className="space-y-3">
            {reports.slice(1).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(report.generatedAt).toLocaleDateString()} - 
                      {report.testCount} tests, {report.findingCount} findings
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskScoreColor(report.riskScore)}`}>
                    Risk: {report.riskScore}/100
                  </span>
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reports State */}
      {!latestReport && !isRunning && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Security Reports</h3>
          <p className="text-gray-600 mb-6">
            Run your first penetration test to assess security compliance and identify potential vulnerabilities.
          </p>
          <button
            onClick={runPenetrationTest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Security Assessment
          </button>
        </div>
      )}
    </div>
  );
} 