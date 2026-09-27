import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getToken } from 'next-auth/jwt';

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
 * Handle authentication middleware logic for protected admin and PPDB routes
 */
export async function handleAuthMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, origin } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isPpdbDashboardRoute = pathname.startsWith('/dashboard-ppdb/dashboard');
  const isLegacyPpdbLogin = pathname === '/dashboard-ppdb/login';
  const isLoginRoute = pathname === '/login';

  // Redirect legacy PPDB login to unified login
  if (isLegacyPpdbLogin) {
    const loginUrl = new URL('/login', origin);
    return NextResponse.redirect(loginUrl);
  }

  // Protected routes require authentication
  if (!token && (isAdminRoute || isPpdbDashboardRoute)) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Allow login page for unauthenticated users
  if (!token && isLoginRoute) {
    return NextResponse.next();
  }

  // Verify token if present
  if (token) {
    const { isValid, role } = await verifyAdminToken(token);

    // Invalid/expired token
    if (!isValid) {
      const response = NextResponse.redirect(new URL('/login?reason=session_expired', origin));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Authenticated user on login page -> redirect to appropriate dashboard
    if (isLoginRoute) {
      const dashboardPath = role === 'ADMIN' ? '/admin' : '/dashboard-ppdb/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, origin));
    }

    // Role guard: USER cannot access admin routes
    if (isAdminRoute && role === 'USER') {
      return NextResponse.redirect(new URL('/dashboard-ppdb/dashboard', origin));
    }

    // Valid token + accessing protected route -> allow
    if (isAdminRoute || isPpdbDashboardRoute) {
      return NextResponse.next();
    }
  }

  // Default: allow
  return NextResponse.next();
}