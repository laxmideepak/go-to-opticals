import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const webhookSchema = z.object({
  url: z.string().url('Valid webhook URL is required'),
  events: z.array(z.enum(['intake', 'satisfaction', 'analytics'])).min(1, 'At least one event type is required'),
  secret: z.string().optional(),
});

// In a real application, this would be stored in a database
let webhookSubscriptions: Array<{
  id: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  createdAt: Date;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the webhook subscription
    const validatedData = webhookSchema.parse(body);
    
    // Generate a unique ID for the webhook
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the webhook subscription
    const webhook = {
      id: webhookId,
      isActive: true,
      createdAt: new Date(),
      ...validatedData,
    };
    
    // In a real application, you would save to a database
    webhookSubscriptions.push(webhook);
    
    console.log('Webhook subscription created:', {
      id: webhookId,
      url: webhook.url,
      events: webhook.events,
      createdAt: webhook.createdAt,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Webhook subscription created successfully',
      webhookId,
      createdAt: webhook.createdAt,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook subscription error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid webhook configuration',
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
    const activeOnly = searchParams.get('active') === 'true';
    
    let filteredWebhooks = webhookSubscriptions;
    
    if (activeOnly) {
      filteredWebhooks = filteredWebhooks.filter(webhook => webhook.isActive);
    }
    
    // Return webhook subscriptions (without sensitive data)
    const webhooks = filteredWebhooks.map(webhook => ({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
      // Don't include secret in response
    }));
    
    return NextResponse.json({
      success: true,
      data: webhooks,
      total: filteredWebhooks.length,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching webhook subscriptions:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

// Helper function to send webhook notifications
export async function sendWebhookNotification(event: string, data: any) {
  const relevantWebhooks = webhookSubscriptions.filter(
    webhook => webhook.isActive && webhook.events.includes(event)
  );
  
  const notifications = relevantWebhooks.map(async (webhook) => {
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (webhook.secret) {
        // In a real application, you would implement proper signature verification
        headers['X-Webhook-Signature'] = `sha256=${webhook.secret}`;
      }
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error(`Webhook notification failed for ${webhook.url}:`, response.status);
      }
      
      return { webhookId: webhook.id, success: response.ok };
    } catch (error) {
      console.error(`Webhook notification error for ${webhook.url}:`, error);
      return { webhookId: webhook.id, success: false, error: error.message };
    }
  });
  
  return Promise.all(notifications);
} 