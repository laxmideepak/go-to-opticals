import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';
import { z } from 'zod';

const notificationRequestSchema = z.object({
  type: z.enum(['sms', 'email']),
  recipient: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  template: z.enum(['satisfactionSurvey', 'appointmentReminder', 'appointmentConfirmation']),
  data: z.object({
    appointmentId: z.string().optional(),
    doctorName: z.string().optional(),
    appointmentDate: z.string().optional(),
    appointmentTime: z.string().optional(),
    location: z.string().optional(),
    surveyUrl: z.string().optional(),
  }),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

const satisfactionSurveySchema = z.object({
  recipient: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  appointmentData: z.object({
    appointmentId: z.string(),
    doctorName: z.string(),
    appointmentDate: z.string(),
    appointmentTime: z.string(),
    location: z.string(),
  }),
});

const appointmentReminderSchema = z.object({
  recipient: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  appointmentData: z.object({
    appointmentId: z.string(),
    doctorName: z.string(),
    appointmentDate: z.string(),
    appointmentTime: z.string(),
    location: z.string(),
  }),
});

const appointmentConfirmationSchema = z.object({
  recipient: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  appointmentData: z.object({
    appointmentId: z.string(),
    doctorName: z.string(),
    appointmentDate: z.string(),
    appointmentTime: z.string(),
    location: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Determine the type of notification request
    if (body.template === 'satisfactionSurvey') {
      const validatedData = satisfactionSurveySchema.parse(body);
      const response = await NotificationService.sendSatisfactionSurvey(
        validatedData.recipient,
        validatedData.appointmentData
      );
      
      return NextResponse.json({
        success: response.success,
        message: response.success ? 'Satisfaction survey notification sent' : 'Failed to send notification',
        data: response,
      });
    }
    
    if (body.template === 'appointmentReminder') {
      const validatedData = appointmentReminderSchema.parse(body);
      const response = await NotificationService.sendAppointmentReminder(
        validatedData.recipient,
        validatedData.appointmentData
      );
      
      return NextResponse.json({
        success: response.success,
        message: response.success ? 'Appointment reminder sent' : 'Failed to send reminder',
        data: response,
      });
    }
    
    if (body.template === 'appointmentConfirmation') {
      const validatedData = appointmentConfirmationSchema.parse(body);
      const response = await NotificationService.sendAppointmentConfirmation(
        validatedData.recipient,
        validatedData.appointmentData
      );
      
      return NextResponse.json({
        success: response.success,
        message: response.success ? 'Appointment confirmation sent' : 'Failed to send confirmation',
        data: response,
      });
    }
    
    // Generic notification request
    const validatedData = notificationRequestSchema.parse(body);
    const response = await NotificationService.sendNotification(validatedData);
    
    return NextResponse.json({
      success: response.success,
      message: response.success ? 'Notification sent successfully' : 'Failed to send notification',
      data: response,
    });
    
  } catch (error) {
    console.error('Notification API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid notification request',
        errors: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'logs') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      const logs = NotificationService.getNotificationLogs(limit, offset);
      
      return NextResponse.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    }
    
    if (action === 'stats') {
      const stats = NotificationService.getNotificationStats();
      
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }
    
    if (action === 'retry') {
      const retryCount = await NotificationService.retryFailedNotifications();
      
      return NextResponse.json({
        success: true,
        message: `Retried ${retryCount} failed notifications`,
        data: { retryCount },
      });
    }
    
    // Default: return stats
    const stats = NotificationService.getNotificationStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('Error fetching notification data:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 