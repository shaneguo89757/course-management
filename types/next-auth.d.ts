import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
        };
        supabaseId: string | null;
        supabaseJWT: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        supabaseId: string | null;
        supabaseJWT: string | null;
    }
}
