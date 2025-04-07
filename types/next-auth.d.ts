import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: User;
        accessToken: string;
        error: string | null;
        supabaseId: string | null;
        supabaseJWT: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string;
        accessTokenExpires: number | undefined;
        refreshToken: string;
        user: User;
        supabaseId: string | null;
        supabaseJWT: string | null;
    }
}
