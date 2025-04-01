import { createClient } from "@/utils/supabase/server";

export async function supabaseAuth(
    provider: string,
    providerAccountId: string
): Promise<string | null> {
    const supabase = await createClient();

    try {
        // 1. 檢查 login 是否存在
        const { data: existingAuth, error: authCheckError } = await supabase
            .from("auth")
            .select("user_id")
            .eq("provider", provider)
            .eq("provider_id", providerAccountId)
            .single();

        if (authCheckError && authCheckError.code !== "PGRST116") {
            console.error("Login check error:", authCheckError);
            throw new Error("Failed to check login status");
        }

        // 2a. 如果 login 已存在，使用對應的 user_id
        if (existingAuth) {
            return existingAuth.user_id;
        }

        // 2b. 如果是新的 login，使用事務函數創建用戶和登入記錄
        const { data, error: rpcError } = await supabase.rpc("create_user_and_auth", {
            p_provider: provider,
            p_provider_id: providerAccountId
        });

        if (rpcError) {
            console.error("RPC error:", rpcError);
            throw new Error("Failed to create user and login");
        }

        if (!data) {
            throw new Error("No data returned from create_user_and_login");
        }

        return data;
    } catch (error) {
        console.error("Supabase auth error:", error);
        return null;
    }
}
