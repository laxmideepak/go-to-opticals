'use client';

import { useState, useEffect } from 'react';
import { AuditLogger, type AuditLogEntry } from '@/lib/security';
import { Shield, AlertTriangle, CheckCircle, Clock, User, Globe } from 'lucide-react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadLogs = () => {
      setLogs(AuditLogger.getLogs());
    };

    loadLogs();

    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.resource.toLowerCase().includes(filter.toLowerCase()) ||
    log.userId?.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Security Audit Log</h2>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          <button
            onClick={() => setLogs(AuditLogger.getLogs())}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter logs by action, resource, or user..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                log.success ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(log.success)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-600">{log.resource}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    
                    {log.userId && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{log.userId}</span>
                      </div>
                    )}
                    
                    {log.ipAddress && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                  
                  {log.details && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  {log.errorMessage && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {log.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total logs: {logs.length} | Filtered: {filteredLogs.length}
      </div>
    </div>
  );
} 