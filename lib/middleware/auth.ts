import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';
const COOKIE_NAME = 'admin_session';

/**
 * Verify admin JWT token using jose (Edge-compatible)
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return false;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    // Token invalid, expired, or malformed
    return false;
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
  const isLoginRoute = pathname === '/login' || pathname === '/dashboard-ppdb/login';
  const loginPath = isPpdbDashboardRoute || pathname === '/dashboard-ppdb/login'
    ? '/dashboard-ppdb/login'
    : '/login';
  const dashboardPath = pathname === '/dashboard-ppdb/login'
    ? '/dashboard-ppdb/dashboard'
    : '/admin';

  // No token and accessing a protected route -> redirect to its login page
  if (!token && (isAdminRoute || isPpdbDashboardRoute)) {
    const loginUrl = new URL(loginPath, origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // No token and accessing /login -> allow
  if (!token && isLoginRoute) {
    return NextResponse.next();
  }

  // Has token -> verify it
  if (token) {
    const isValid = await verifyAdminToken(token);

    // Invalid/expired token
    if (!isValid) {
      const response = NextResponse.redirect(new URL(`${loginPath}?reason=session_expired`, origin));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Valid token + accessing a login page -> redirect to its dashboard
    if (isLoginRoute) {
      return NextResponse.redirect(new URL(dashboardPath, origin));
    }

    // Valid token + accessing a protected route -> allow
    if (isAdminRoute || isPpdbDashboardRoute) {
      return NextResponse.next();
    }
  }

  // Default: allow
  return NextResponse.next();
}
