'use server';

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = process.env.JWT_SECRET ?? undefined;
const COOKIE_NAME = 'admin_session';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function isFormData(obj: unknown): obj is FormData {
  return (
    obj !== null &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as any).get === 'function'
  );
}

/**
 * Login Action
 */
export async function loginAction(
  prevStateOrFormData: ActionResult | FormData | unknown,
  formDataParam?: FormData
): Promise<ActionResult> {
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
    let user = await prisma.user.findFirst({
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

    // Verifikasi password (dukung bcrypt hash & plain-text fallback jika diinput manual di Studio)
    let isPasswordValid = false;

    if (user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Jika password di DB diinput plain text di Studio (contoh: "admin123")
      if (password === user.password) {
        isPasswordValid = true;
        // Otomatis update ke bcrypt hash yang aman
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

    // Generate JWT Token
    const secretKey = JWT_SECRET || 'default-secret-key-smktibazma-change-in-prod';
    const secret = new TextEncoder().encode(secretKey);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Simpan HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Logout Action
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  revalidatePath('/admin');
  return { success: true };
}
