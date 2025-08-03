import { NextRequest, NextResponse } from 'next/server';

// In a real application, this would be a database query
// For now, we'll simulate analytics data
const mockAnalyticsData = {
  attributionSources: {
    'walk-in': 45,
    'meta-facebook-ads': 25,
    'instagram-ads': 15,
    'whatsapp-business-ads': 8,
    'google-ads': 5,
    'referral': 2,
    'other': 0
  },
  insuranceProviders: {
    'vsp': 35,
    'eyemed': 25,
    'spectera': 15,
    'united-healthcare': 12,
    'aetna': 8,
    'cigna': 3,
    'blue-cross': 2,
    'other': 0
  },
  satisfactionScores: {
    '5': 78,
    '4': 15,
    '3': 5,
    '2': 1,
    '1': 1
  },
  dailySubmissions: [
    { date: '2024-08-01', count: 12 },
    { date: '2024-08-02', count: 15 },
    { date: '2024-08-03', count: 18 },
    { date: '2024-08-04', count: 22 },
    { date: '2024-08-05', count: 19 },
    { date: '2024-08-06', count: 25 },
    { date: '2024-08-07', count: 28 }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // In a real application, you would implement proper authentication
    // and authorization checks here
    
    switch (type) {
      case 'attribution':
        return NextResponse.json({
          success: true,
          data: mockAnalyticsData.attributionSources,
        });
        
      case 'insurance':
        return NextResponse.json({
          success: true,
          data: mockAnalyticsData.insuranceProviders,
        });
        
      case 'satisfaction':
        return NextResponse.json({
          success: true,
          data: mockAnalyticsData.satisfactionScores,
        });
        
      case 'daily':
        return NextResponse.json({
          success: true,
          data: mockAnalyticsData.dailySubmissions,
        });
        
      case 'summary':
        const totalSubmissions = Object.values(mockAnalyticsData.attributionSources).reduce((a, b) => a + b, 0);
        const avgSatisfaction = Object.entries(mockAnalyticsData.satisfactionScores)
          .reduce((acc, [score, count]) => acc + (parseInt(score) * count), 0) / 
          Object.values(mockAnalyticsData.satisfactionScores).reduce((a, b) => a + b, 0);
        
        return NextResponse.json({
          success: true,
          data: {
            totalSubmissions,
            avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
            topAttributionSource: Object.entries(mockAnalyticsData.attributionSources)
              .sort(([,a], [,b]) => b - a)[0],
            topInsuranceProvider: Object.entries(mockAnalyticsData.insuranceProviders)
              .sort(([,a], [,b]) => b - a)[0],
          },
        });
        
      default:
        return NextResponse.json({
          success: true,
          data: mockAnalyticsData,
        });
    }
    
  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 