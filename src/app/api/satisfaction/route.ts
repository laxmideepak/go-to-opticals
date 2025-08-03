import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DataEncryption, AuditLogger, DataSanitization } from '@/lib/security';

const satisfactionSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
  patientSessionId: z.string().optional(),
});

// In a real application, this would be stored in a database with encryption
let satisfactionSubmissions: Array<{
  id: string;
  timestamp: Date;
  encryptedData: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the satisfaction data
    const validatedData = satisfactionSchema.parse(body);
    
    // Validate HIPAA compliance
    const phiValidation = DataSanitization.validatePHI(validatedData);
    if (!phiValidation.isValid) {
      AuditLogger.log({
        userId: 'anonymous',
        action: 'POST',
        resource: '/api/satisfaction',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { errors: phiValidation.errors },
        success: false,
        errorMessage: 'HIPAA validation failed',
      });
      
      return NextResponse.json({
        success: false,
        message: 'Invalid data - HIPAA compliance check failed',
        errors: phiValidation.errors,
      }, { status: 400 });
    }
    
    // Generate a unique ID for the submission
    const submissionId = `satisfaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Encrypt sensitive data before storage
    const encryptedData = DataEncryption.encryptObject(validatedData);
    
    // Create the submission record with encrypted data
    const submission = {
      id: submissionId,
      timestamp: new Date(),
      encryptedData,
    };
    
    // In a real application, you would save to a database
    satisfactionSubmissions.push(submission);
    
    // Audit log the submission (sanitized for security)
    const sanitizedData = DataSanitization.sanitizePHI(validatedData);
    AuditLogger.log({
      userId: 'anonymous',
      action: 'POST',
      resource: '/api/satisfaction',
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        submissionId,
        doctorId: validatedData.doctorId,
        doctorName: validatedData.doctorName,
        rating: validatedData.rating,
        sanitizedData,
      },
      success: true,
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send webhook notification
    try {
      const { sendWebhookNotification } = await import('../webhook/route');
      await sendWebhookNotification('satisfaction', {
        submissionId,
        doctorId: validatedData.doctorId,
        doctorName: validatedData.doctorName,
        rating: validatedData.rating,
        timestamp: submission.timestamp,
      });
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Satisfaction survey submitted successfully - Data encrypted and stored securely',
      submissionId,
      timestamp: submission.timestamp,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Satisfaction survey submission error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid satisfaction survey data',
        errors: error.message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would implement proper authentication
    // and authorization checks here
    
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let filteredSubmissions = satisfactionSubmissions;
    
    // Filter by doctor if specified
    if (doctorId) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.doctorId === doctorId
      );
    }
    
    // Return paginated submissions (decrypting data for authorized access)
    const submissions = filteredSubmissions
      .slice(offset, offset + limit)
      .map(submission => {
        try {
          const decryptedData = DataEncryption.decryptObject(submission.encryptedData);
          return {
            id: submission.id,
            doctorId: decryptedData.doctorId,
            doctorName: decryptedData.doctorName,
            rating: decryptedData.rating,
            timestamp: submission.timestamp,
            // Don't include comments in list view for privacy
          };
        } catch (error) {
          console.error('Error decrypting submission:', error);
          return {
            id: submission.id,
            doctorId: 'unknown',
            doctorName: 'unknown',
            rating: 0,
            timestamp: submission.timestamp,
          };
        }
      });
    
    // Calculate average rating
    const averageRating = filteredSubmissions.length > 0
      ? filteredSubmissions.reduce((sum, submission) => sum + submission.rating, 0) / filteredSubmissions.length
      : 0;
    
    return NextResponse.json({
      success: true,
      data: submissions,
      total: filteredSubmissions.length,
      averageRating: Math.round(averageRating * 10) / 10,
      limit,
      offset,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching satisfaction submissions:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 