'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'auth_session';

export type PpdbAuthResult = {
  success: boolean;
  error?: string;
};

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

async function createPpdbSession(user: SessionUser): Promise<boolean> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET belum dikonfigurasi');
    return false;
  }

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: 'USER',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return true;
}

export async function loginPpdbAction(formData: FormData): Promise<PpdbAuthResult> {
  const emailValue = formData.get('email');
  const passwordValue = formData.get('password');

  if (typeof emailValue !== 'string' || typeof passwordValue !== 'string') {
    return { success: false, error: 'Email dan password wajib diisi' };
  }

  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;

  if (!email || !password) {
    return { success: false, error: 'Email dan password wajib diisi' };
  }

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
    } else if (password === user.password) {
      isPasswordValid = true;
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(password, 10) },
      });
    }

    if (!isPasswordValid) {
      return { success: false, error: 'Email atau password salah' };
    }

    if (!(await createPpdbSession(user))) {
      return { success: false, error: 'Konfigurasi autentikasi belum tersedia' };
    }

    revalidatePath('/dashboard-ppdb/dashboard');
    return { success: true };
  } catch (error) {
    console.error('PPDB login error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

export async function registerPpdbAction(formData: FormData): Promise<PpdbAuthResult> {
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
      },
    });

    await createPpdbSession(user);

    revalidatePath('/dashboard-ppdb/dashboard');
    return { success: true };
  } catch (error) {
    console.error('PPDB register error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

export async function logoutPpdbAction(): Promise<PpdbAuthResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete('admin_session');
    revalidatePath('/dashboard-ppdb/dashboard');
    return { success: true };
  } catch (error) {
    console.error('PPDB logout error:', error);
    return { success: false, error: 'Gagal keluar dari akun' };
  }
}