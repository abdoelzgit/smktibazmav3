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
  } catch (error) {
    // Token invalid, expired, or malformed
    return false;
  }
}

/**
 * Handle authentication middleware logic for /admin and /login routes
 */
export async function handleAuthMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, origin } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // No token and accessing /admin -> redirect to login
  if (!token && isAdminRoute) {
    const loginUrl = new URL('/login', origin);
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
      const response = NextResponse.redirect(new URL('/login?reason=session_expired', origin));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Valid token + accessing /login -> redirect to /admin
    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/admin', origin));
    }

    // Valid token + accessing /admin -> allow
    if (isAdminRoute) {
      return NextResponse.next();
    }
  }

  // Default: allow
  return NextResponse.next();
}
