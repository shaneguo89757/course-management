import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
    supabaseId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    supabaseId: string | null;
  }
} 