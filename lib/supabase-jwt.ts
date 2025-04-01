import { sign, verify } from "jsonwebtoken";

type JWTPayload = {
    sub: string;
    role: "authenticated" | "service_role";
    exp: number;
};

export function generateSupabaseJWT(
    userId: string,
    role: "authenticated" | "service_role" = "authenticated"
): string {
    const payload: JWTPayload = {
        sub: userId,
        role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 // 8 小時有效期
    };

    return sign(payload, process.env.SUPABASE_JWT_SECRET!, { algorithm: "HS256" });
}

export function verifySupabaseJWT(token: string): JWTPayload | null {
    try {
        return verify(token, process.env.SUPABASE_JWT_SECRET!) as JWTPayload;
    } catch (error) {
        console.error("JWT 驗證失敗:", error);
        return null;
    }
}
