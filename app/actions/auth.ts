'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const COOKIE_NAME = 'auth_session';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AuthResult = {
  success: boolean;
  role?: 'ADMIN' | 'USER';
  redirectTo?: string;
  error?: string;
};

type TokenPayload = {
  userId: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
};

function isFormData(obj: unknown): obj is FormData {
  return (
    obj !== null &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as Record<string, unknown>).get === 'function'
  );
}

export async function loginAction(
  prevStateOrFormData: ActionResult | FormData | unknown,
  formDataParam?: FormData
): Promise<AuthResult> {
  let formData: FormData | null = null;

  if (isFormData(formDataParam)) {
    formData = formDataParam;
  } else if (isFormData(prevStateOrFormData)) {
    formData = prevStateOrFormData;
  }

  if (!formData) {
    console.error('[loginAction] Invalid formData received:', {
      prevStateOrFormData,
      formDataParam,
    });
    return { success: false, error: 'Data formulir tidak valid' };
  }

  const emailInput = (formData.get('username') || formData.get('email')) as string;
  const passwordInput = formData.get('password') as string;

  if (!emailInput || !passwordInput) {
    return { success: false, error: 'Email dan password wajib diisi' };
  }

  const email = emailInput.trim();
  const password = passwordInput;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return { success: false, error: 'Email atau password salah' };
    }

    let isPasswordValid = false;

    if (user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      if (password === user.password) {
        isPasswordValid = true;
        const newHashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHashedPassword },
        });
      }
    }

    if (!isPasswordValid) {
      return { success: false, error: 'Email atau password salah' };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    const redirectTo = user.role === 'ADMIN' ? '/admin' : '/dashboard-ppdb/dashboard';
    revalidatePath(redirectTo);
    
    return { success: true, role: user.role, redirectTo };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

export async function registerPpdbAction(formData: FormData): Promise<AuthResult> {
  const nameValue = formData.get('name');
  const emailValue = formData.get('email');
  const passwordValue = formData.get('password');

  if (
    typeof nameValue !== 'string' ||
    typeof emailValue !== 'string' ||
    typeof passwordValue !== 'string'
  ) {
    return { success: false, error: 'Data pendaftaran tidak valid' };
  }

  const name = nameValue.trim();
  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;

  if (!name || !email || !password) {
    return { success: false, error: 'Nama, email, dan password wajib diisi' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password minimal 8 karakter' };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    if (!JWT_SECRET) {
      return { success: false, error: 'Konfigurasi autentikasi belum tersedia' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: 'USER',
      },
    });

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    revalidatePath('/dashboard-ppdb/dashboard');
    return { success: true, role: 'USER', redirectTo: '/dashboard-ppdb/dashboard' };
  } catch (error) {
    console.error('PPDB register error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/dashboard-ppdb/dashboard');
  return { success: true };
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const userId = payload.userId as string;
    const email = payload.email as string;
    const name = payload.name as string | null;
    const role = payload.role as 'ADMIN' | 'USER';

    if (!userId || !email || !role) {
      return null;
    }

    return { userId, email, name, role };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}