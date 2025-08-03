'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  RefreshCw,
  BarChart3,
  Calendar,
  User
} from 'lucide-react';

interface NotificationStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalCost: number;
  byType: {
    sms: number;
    email: number;
  };
  byTemplate: {
    satisfactionSurvey: number;
    appointmentReminder: number;
    appointmentConfirmation: number;
  };
}

interface NotificationLog {
  id: string;
  type: 'sms' | 'email';
  recipient: string;
  template: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  messageId?: string;
  provider?: string;
  error?: string;
  cost?: number;
  sentAt: Date;
  deliveredAt?: Date;
  retryCount: number;
  metadata?: any;
}

export default function NotificationDashboard() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/notifications?action=stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      // Fetch logs
      const logsResponse = await fetch('/api/notifications?action=logs&limit=20');
      const logsData = await logsResponse.json();
      
      if (logsData.success) {
        setLogs(logsData.data);
      }
    } catch (error) {
      console.error('Error fetching notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedNotifications = async () => {
    try {
      setRetrying(true);
      const response = await fetch('/api/notifications?action=retry', { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        alert(`Retried ${data.data.retryCount} failed notifications`);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error retrying notifications:', error);
      alert('Failed to retry notifications');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'bounced':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Dashboard</h1>
          <p className="text-gray-600">Monitor SMS and email notification delivery</p>
        </div>
        <button
          onClick={retryFailedNotifications}
          disabled={retrying}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Retrying...' : 'Retry Failed'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Type</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm text-gray-600">{stats.byType.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">SMS</span>
                </div>
                <span className="text-sm text-gray-600">{stats.byType.sms}</span>
              </div>
            </div>
          </div>

          {/* By Template */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Template</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Satisfaction Survey</span>
                <span className="text-sm text-gray-600">{stats.byTemplate.satisfactionSurvey}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Appointment Reminder</span>
                <span className="text-sm text-gray-600">{stats.byTemplate.appointmentReminder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Appointment Confirmation</span>
                <span className="text-sm text-gray-600">{stats.byTemplate.appointmentConfirmation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm text-gray-900 capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.type === 'email' ? (
                        <span className="font-mono">{log.recipient}</span>
                      ) : (
                        <span>{log.recipient}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {log.template.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.cost ? formatCost(log.cost) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.sentAt.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 