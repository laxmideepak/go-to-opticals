import { NextRequest, NextResponse } from 'next/server';
import { intakeFormSchema } from '@/lib/validation';
import type { IntakeFormSchema } from '@/lib/validation';
import { DataEncryption, AuditLogger, DataSanitization } from '@/lib/security';

// In a real application, you would use a proper database
// For now, we'll simulate data storage with encryption
let formSubmissions: Array<{ id: string; timestamp: Date; encryptedData: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = intakeFormSchema.parse(body);
    
    // Validate HIPAA compliance
    const phiValidation = DataSanitization.validatePHI(validatedData);
    if (!phiValidation.isValid) {
      AuditLogger.log({
        userId: 'anonymous',
        action: 'POST',
        resource: '/api/intake',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { errors: phiValidation.errors },
        success: false,
        errorMessage: 'HIPAA validation failed',
      });
      
      return NextResponse.json({
        success: false,
        message: 'Invalid form data - HIPAA compliance check failed',
        errors: phiValidation.errors,
      }, { status: 400 });
    }
    
    // Generate a unique ID for the submission
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Encrypt sensitive data before storage
    const encryptedData = DataEncryption.encryptObject(validatedData);
    
    // Create the submission record with encrypted data
    const submission = {
      id: submissionId,
      timestamp: new Date(),
      encryptedData,
    };
    
    // In a real application, you would save to a database
    // For now, we'll store in memory (not recommended for production)
    formSubmissions.push(submission);
    
    // Audit log the submission (sanitized for security)
    const sanitizedData = DataSanitization.sanitizePHI(validatedData);
    AuditLogger.log({
      userId: 'anonymous',
      action: 'POST',
      resource: '/api/intake',
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        submissionId,
        attributionSource: validatedData.attributionSource,
        insuranceProvider: validatedData.insuranceProvider,
        sanitizedData,
      },
      success: true,
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send webhook notification
    try {
      const { sendWebhookNotification } = await import('../webhook/route');
      await sendWebhookNotification('intake', {
        submissionId,
        attributionSource: validatedData.attributionSource,
        insuranceProvider: validatedData.insuranceProvider,
        timestamp: submission.timestamp,
      });
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }

    // Send to scheduling system
    try {
      const schedulingResponse = await fetch(`${request.nextUrl.origin}/api/scheduling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validatedData,
          submissionId,
        }),
      });
      
      if (schedulingResponse.ok) {
        const schedulingResult = await schedulingResponse.json();
        console.log('Scheduling successful:', schedulingResult.data);
      } else {
        console.error('Scheduling failed:', await schedulingResponse.text());
      }
    } catch (error) {
      console.error('Error sending to scheduling system:', error);
    }
    
    // Get scheduling data if available
    let schedulingData = null;
    try {
      const schedulingResponse = await fetch(`${request.nextUrl.origin}/api/scheduling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validatedData,
          submissionId,
        }),
      });
      
      if (schedulingResponse.ok) {
        const schedulingResult = await schedulingResponse.json();
        schedulingData = schedulingResult.data;
        console.log('Scheduling successful:', schedulingData);
      } else {
        console.error('Scheduling failed:', await schedulingResponse.text());
      }
    } catch (error) {
      console.error('Error sending to scheduling system:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully - Data encrypted and stored securely',
      submissionId,
      timestamp: submission.timestamp,
      schedulingData,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Return paginated submissions (decrypting data for authorized access)
    const submissions = formSubmissions
      .slice(offset, offset + limit)
      .map(submission => {
        try {
          const decryptedData = DataEncryption.decryptObject(submission.encryptedData);
          return {
            id: submission.id,
            timestamp: submission.timestamp,
            attributionSource: decryptedData.attributionSource,
            insuranceProvider: decryptedData.insuranceProvider,
            preferredLanguage: decryptedData.preferredLanguage,
            // Only return non-sensitive data for listing
          };
        } catch (error) {
          console.error('Error decrypting submission:', error);
          return {
            id: submission.id,
            timestamp: submission.timestamp,
            attributionSource: 'unknown',
            insuranceProvider: 'unknown',
            preferredLanguage: 'unknown',
          };
        }
      });
    
    return NextResponse.json({
      success: true,
      data: submissions,
      total: formSubmissions.length,
      limit,
      offset,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 