'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Star, 
  Eye,
  MessageSquare,
  Activity
} from 'lucide-react';

interface DashboardData {
  attributionSources: Record<string, number>;
  insuranceProviders: Record<string, number>;
  satisfactionScores: Record<string, number>;
  dailySubmissions: Array<{ date: string; count: number }>;
  summary: {
    totalSubmissions: number;
    avgSatisfaction: number;
    topAttributionSource: [string, number];
    topInsuranceProvider: [string, number];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all analytics data
      const [attributionRes, insuranceRes, satisfactionRes, dailyRes, summaryRes] = await Promise.all([
        fetch('/api/analytics?type=attribution'),
        fetch('/api/analytics?type=insurance'),
        fetch('/api/analytics?type=satisfaction'),
        fetch('/api/analytics?type=daily'),
        fetch('/api/analytics?type=summary'),
      ]);

      const attributionData = await attributionRes.json();
      const insuranceData = await insuranceRes.json();
      const satisfactionData = await satisfactionRes.json();
      const dailyData = await dailyRes.json();
      const summaryData = await summaryRes.json();

      if (attributionData.success && insuranceData.success && satisfactionData.success && 
          dailyData.success && summaryData.success) {
        setData({
          attributionSources: attributionData.data,
          insuranceProviders: insuranceData.data,
          satisfactionScores: satisfactionData.data,
          dailySubmissions: dailyData.data,
          summary: summaryData.data,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    if (!data) return;
    
    // Create CSV content
    const csvContent = [
      'Date,Attribution Source,Insurance Provider,Satisfaction Score',
      ...Object.entries(data.attributionSources).map(([source, count]) => 
        `${new Date().toISOString().split('T')[0]},${source},,`
      ),
      ...Object.entries(data.insuranceProviders).map(([provider, count]) => 
        `${new Date().toISOString().split('T')[0]},,${provider},`
      ),
      ...Object.entries(data.satisfactionScores).map(([score, count]) => 
        `${new Date().toISOString().split('T')[0]},,,${score}`
      ),
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goto-optical-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Failed to load dashboard data</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const attributionChartData = Object.entries(data.attributionSources).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  const insuranceChartData = Object.entries(data.insuranceProviders).map(([provider, count]) => ({
    name: provider,
    value: count,
  }));

  const satisfactionChartData = Object.entries(data.satisfactionScores).map(([score, count]) => ({
    name: `${score} Stars`,
    value: count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GoTo Optical Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time insights into patient attribution, insurance mix, and satisfaction
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.avgSatisfaction}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Channel</p>
                <p className="text-lg font-bold text-gray-900">{data.summary.topAttributionSource[0]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Insurance</p>
                <p className="text-lg font-bold text-gray-900">{data.summary.topInsuranceProvider[0]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attribution Sources */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attribution Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attributionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Insurance Providers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Providers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insuranceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={satisfactionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Submissions Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Submissions Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailySubmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 