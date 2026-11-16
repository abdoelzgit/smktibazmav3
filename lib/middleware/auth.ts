import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';
const COOKIE_NAME = 'auth_session';

/**
 * Verify JWT token and extract role (Edge-compatible)
 */
export async function verifyAdminToken(token: string): Promise<{ isValid: boolean; role?: 'ADMIN' | 'USER' }> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return { isValid: false };
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as 'ADMIN' | 'USER';
    return { isValid: true, role };
  } catch {
    return { isValid: false };
  }
}

/**
 * Handle authentication middleware logic for protected admin and SPMB routes
 */
export async function handleAuthMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, origin } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isParticipantRoute = pathname.startsWith('/spmb/dashboard')
    || pathname === '/spmb/form'
    || pathname.startsWith('/ppdb/dashboard');
  const isLegacyPpdbLogin = pathname === '/ppdb/login';
  const isLegacySpmbLogin = pathname === '/spmb/login';
  const isLoginRoute = pathname === '/login';

  // Keep old login URLs working while using one shared login page.
  if (isLegacyPpdbLogin || isLegacySpmbLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Protected routes require authentication
  if (!token && (isAdminRoute || isParticipantRoute)) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    if (isAdminRoute) {
      loginUrl.searchParams.set('reason', 'unauthorized');
    }
    if (pathname === '/spmb/form') {
      loginUrl.searchParams.set('mode', 'register');
    }
    return NextResponse.redirect(loginUrl);
  }

  // Allow login page for unauthenticated users
  if (!token && isLoginRoute) {
    return NextResponse.next();
  }

  // Public SPMB information pages do not require a valid participant session.
  if (!isAdminRoute && !isParticipantRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  // Verify token if present
  if (token) {
    const { isValid, role } = await verifyAdminToken(token);

    // Invalid/expired token
    if (!isValid) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('reason', 'session_expired');
      if (isParticipantRoute) {
        loginUrl.searchParams.set('callbackUrl', pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Authenticated user on login page -> redirect to appropriate dashboard
    if (isLoginRoute) {
      const dashboardPath = role === 'ADMIN' ? '/admin' : '/spmb/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, origin));
    }

    // Role guard: USER cannot access admin routes
    if (isAdminRoute && role === 'USER') {
      return NextResponse.redirect(new URL('/spmb/dashboard', origin));
    }

    // Valid token + accessing protected route -> allow
    if (isAdminRoute || isParticipantRoute) {
      return NextResponse.next();
    }
  }

  // Default: allow
  return NextResponse.next();
}
