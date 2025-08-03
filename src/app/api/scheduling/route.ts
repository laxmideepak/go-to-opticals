import { NextRequest, NextResponse } from 'next/server';
import { SchedulingService } from '@/lib/scheduling';
import { DataEncryption, AuditLogger } from '@/lib/security';

// Store scheduling requests for demo purposes
let schedulingRequests: Array<{
  id: string;
  timestamp: Date;
  encryptedData: string;
  response?: any;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the scheduling request
    const validation = SchedulingService.validateRequest(body);
    
    if (!validation.isValid) {
      AuditLogger.log({
        userId: 'anonymous',
        action: 'POST',
        resource: '/api/scheduling',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { errors: validation.errors, warnings: validation.warnings },
        success: false,
        errorMessage: 'Scheduling validation failed',
      });
      
      return NextResponse.json({
        success: false,
        message: 'Invalid scheduling request',
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 });
    }

    // Transform intake data to scheduling format
    const schedulingRequest = SchedulingService.transformIntakeData(body);
    
    // Encrypt the scheduling request for storage
    const encryptedData = DataEncryption.encryptObject(schedulingRequest);
    
    // Store the request
    const requestId = `scheduling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedRequest = {
      id: requestId,
      timestamp: new Date(),
      encryptedData,
    };
    
    schedulingRequests.push(storedRequest);
    
    // Send to scheduling system
    const schedulingResponse = await SchedulingService.sendSchedulingRequest(schedulingRequest);
    
    // Store the response
    storedRequest.response = schedulingResponse;
    
    // Send appointment confirmation notification
    if (schedulingResponse.success && schedulingResponse.appointmentId) {
      try {
        const { NotificationService } = await import('@/lib/notifications');
        await NotificationService.sendAppointmentConfirmation(
          {
            email: validatedData.email,
            phone: validatedData.phone,
            name: `${validatedData.firstName} ${validatedData.lastName}`,
          },
          {
            appointmentId: schedulingResponse.appointmentId,
            doctorName: schedulingResponse.provider?.name || 'Dr. Bruce Goldstick',
            appointmentDate: schedulingResponse.scheduledDate || '',
            appointmentTime: schedulingResponse.scheduledTime || '',
            location: schedulingResponse.location?.name || 'GoTo Optical - Main Office',
          }
        );
      } catch (error) {
        console.error('Error sending appointment confirmation:', error);
      }
    }
    
    // Audit log the successful scheduling
    AuditLogger.log({
      userId: 'anonymous',
      action: 'POST',
      resource: '/api/scheduling',
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        requestId,
        submissionId: schedulingRequest.submissionId,
        appointmentId: schedulingResponse.appointmentId,
        confirmationNumber: schedulingResponse.confirmationNumber,
        scheduledDate: schedulingResponse.scheduledDate,
        patientName: `${schedulingRequest.firstName} ${schedulingRequest.lastName}`,
      },
      success: true,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: {
        requestId,
        appointmentId: schedulingResponse.appointmentId,
        confirmationNumber: schedulingResponse.confirmationNumber,
        scheduledDate: schedulingResponse.scheduledDate,
        scheduledTime: schedulingResponse.scheduledTime,
        location: schedulingResponse.location,
        provider: schedulingResponse.provider,
        instructions: schedulingResponse.instructions,
        nextSteps: schedulingResponse.nextSteps,
        warnings: schedulingResponse.warnings,
      },
    }, { status: 200 });
    
  } catch (error) {
    console.error('Scheduling error:', error);
    
    AuditLogger.log({
      userId: 'anonymous',
      action: 'POST',
      resource: '/api/scheduling',
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { error: error.message },
      success: false,
      errorMessage: 'Scheduling system error',
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to schedule appointment',
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const appointmentId = searchParams.get('appointmentId');
    
    if (requestId) {
      // Get specific scheduling request
      const request = schedulingRequests.find(r => r.id === requestId);
      if (!request) {
        return NextResponse.json({
          success: false,
          message: 'Scheduling request not found',
        }, { status: 404 });
      }
      
      const decryptedData = DataEncryption.decryptObject(request.encryptedData);
      return NextResponse.json({
        success: true,
        data: {
          id: request.id,
          timestamp: request.timestamp,
          request: decryptedData,
          response: request.response,
        },
      });
    }
    
    if (appointmentId) {
      // Get appointment status from scheduling system
      const status = await SchedulingService.getSchedulingStatus(appointmentId);
      return NextResponse.json({
        success: true,
        data: status,
      });
    }
    
    // Return list of scheduling requests (without sensitive data)
    const requests = schedulingRequests.map(req => ({
      id: req.id,
      timestamp: req.timestamp,
      hasResponse: !!req.response,
      appointmentId: req.response?.appointmentId,
      confirmationNumber: req.response?.confirmationNumber,
      scheduledDate: req.response?.scheduledDate,
    }));
    
    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length,
    });
    
  } catch (error) {
    console.error('Error fetching scheduling data:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 