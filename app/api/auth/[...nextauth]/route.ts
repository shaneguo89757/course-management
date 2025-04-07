import { supabaseAuth } from "@/lib/supabase-auth";
import { generateSupabaseJWT } from "@/lib/supabase-jwt";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
    try {
        const url =
            "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string
            });

        const response = await fetch(url, {
            headers: { "Content-Type": "application/x-www-form-urlencoded"},
            method: "POST"
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw new Error("Failed to refresh access token");
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: refreshedTokens.expires_at!,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken // Fall back to old refresh token
        };
    } catch (error) {
        return {
            ...token,
            error: "RefreshAccessTokenError"
        };
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                },
            },
            checks: ["state"]
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin"
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // 1. Initial sign in
            if (account && user) {
                const supabaseId = await supabaseAuth(account.provider, account.providerAccountId)
                const supabaseJWT = supabaseId ? generateSupabaseJWT(supabaseId, "authenticated", account.expires_at!) : null;

                return {
                    accessToken: account.accessToken,
                    accessTokenExpires: account.expires_at!,
                    refreshToken: account.refresh_token,
                    user,
                    supabaseId,
                    supabaseJWT
                }
            }

            // 2.a Return previous token if the access token has not expired yet
            if (Date.now() < (token.accessTokenExpires as number)*1000) {
                return token;
            }

            // 2.b Refresh the access token
            const refreshedToken = await refreshAccessToken(token);

            // 3. Generate a new supabase JWT
            refreshedToken.supabaseJWT = generateSupabaseJWT(refreshedToken.supabaseId!, "authenticated", refreshedToken.accessTokenExpires!)

            // 4. Return the refreshed token
            return refreshedToken;
        },
        async session({ session, token }) {
            // Every time is call jwt then session will be called
            if (token) {
                session.user = token.user;
                session.accessToken = token.accessToken;
                session.error = token.error as string | null;
                session.supabaseId = token.supabaseId;
                session.supabaseJWT = token.supabaseJWT;
            }

            return session;
        }
    }
});

export { handler as GET, handler as POST };
