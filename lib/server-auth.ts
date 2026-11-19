import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIES = ['auth_session', 'admin_session'] as const;

export async function getAuthenticatedUserFromToken(): Promise<{
  userId: string;
  role: 'ADMIN' | 'USER';
} | null> {
  const cookieStore = await cookies();
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  for (const cookieName of SESSION_COOKIES) {
    const token = cookieStore.get(cookieName)?.value;
    if (!token) continue;

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const userId = typeof payload.userId === 'string' ? payload.userId : '';
      if (!userId) continue;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });
      if (user) return { userId: user.id, role: user.role };
    } catch {
      continue;
    }
  }

  return null;
}
