import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'auth_session';
const LEGACY_COOKIE_NAME = 'admin_session';

export type PPDBUser = { userId: string; email: string };

export async function getPPDBUserFromToken(): Promise<PPDBUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const userId = typeof payload.userId === 'string' ? payload.userId : '';
      const email = typeof payload.email === 'string' ? payload.email : '';
      if (userId && email) return { userId, email };
    } catch {
      // Try the legacy session cookie below.
    }
  }

  const legacyToken = cookieStore.get(LEGACY_COOKIE_NAME)?.value;
  if (!legacyToken || !secret) return null;

  try {
    const { payload } = await jwtVerify(legacyToken, new TextEncoder().encode(secret));
    const userId = typeof payload.userId === 'string' ? payload.userId : '';
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'USER') return null;
    return { userId: user.id, email: user.email };
  } catch {
    return null;
  }
}
