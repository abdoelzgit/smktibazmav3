import { NextRequest } from 'next/server';
import { handleAuthMiddleware } from '@/lib/middleware/auth';

export async function middleware(request: NextRequest) {
  return handleAuthMiddleware(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/dashboard-ppdb/dashboard/:path*',
    '/dashboard-ppdb/login',
  ],
};
