import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'secret';

export const authOptions: NextAuthOptions = {
  secret: JWT_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        let existingUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: user.email,
              mode: 'insensitive',
            },
          },
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name || user.email.split('@')[0],
              password: null as any,
              role: 'USER',
            },
          });
        }

        // Generate unified auth_session cookie for seamless app navigation
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        const jwtToken = await new SignJWT({
          userId: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(secretKey);

        const cookieStore = await cookies();
        cookieStore.set('auth_session', jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        });

        return true;
      } catch (error) {
        console.error('NextAuth signIn error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: user.email,
              mode: 'insensitive',
            },
          },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
