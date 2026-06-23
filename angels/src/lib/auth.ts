import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '@/lib/db';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (adminUsername && adminPasswordHash && credentials.username === adminUsername) {
          const isValid = await bcrypt.compare(credentials.password, adminPasswordHash);
          if (isValid) {
            return { id: 'admin', name: 'Admin', email: 'admin@angels.com', role: 'admin' };
          }
          return null;
        }

        const pool = await getPool();
        const userResult = await pool.request()
          .input('email', sql.NVarChar, credentials.username.toLowerCase().trim())
          .query('SELECT id, email, password, name, role FROM users WHERE email = @email');

        if (userResult.recordset.length === 0) {
          return null;
        }

        const user = userResult.recordset[0];

        if (!user.password || user.role === 'guest') {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name || user.email,
          email: user.email,
          role: user.role || 'customer',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }
  return session;
}

export async function requireCustomer() {
  const session = await getSession();
  if (!session?.user || session.user.role === 'admin') {
    return null;
  }
  if (!session.user.id || session.user.id === 'admin') {
    return null;
  }
  return session;
}
