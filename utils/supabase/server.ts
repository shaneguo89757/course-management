import { createServerClient } from '@supabase/ssr';

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return '';
        },
        set(name: string, value: string, options: any) {
          // 服務器端不需要設置 cookie
        },
        remove(name: string, options: any) {
          // 服務器端不需要移除 cookie
        },
      },
    }
  );
}; 