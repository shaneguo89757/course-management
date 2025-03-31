import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAuth } from '@/lib/supabase-auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      checks: ["state"],
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;
      }
      
      session.supabaseId = token.supabaseId;
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.supabaseId = await supabaseAuth(account.provider, account.providerAccountId);
      }
      
      return token;
    },
  },
});

export { handler as GET, handler as POST };
