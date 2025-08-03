import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS, AuditLogger } from '@/lib/security';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const rateLimit = rateLimitStore.get(ip);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    // First request or window expired
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else if (rateLimit.count >= maxRequests) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  } else {
    // Increment count
    rateLimit.count++;
  }

  // Audit logging for sensitive endpoints
  const sensitivePaths = ['/api/intake', '/api/satisfaction', '/api/analytics'];
  const isSensitivePath = sensitivePaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isSensitivePath) {
    AuditLogger.log({
      userId: request.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous',
      action: request.method,
      resource: request.nextUrl.pathname,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        query: Object.fromEntries(request.nextUrl.searchParams),
        timestamp: new Date().toISOString(),
      },
      success: true,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 