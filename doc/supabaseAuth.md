# Supabase 與 NextAuth 整合項目計劃

## 項目概述

### 目標
建立一個混合身份驗證模型，將 NextAuth 與 Supabase 整合，使用戶僅能存取屬於自己的資料，實現與 Supabase 原生認證相同的安全約束效果。

### 技術架構
- 前端: Next.js 15+, React 19+
- 認證: NextAuth v4
- 資料庫: Supabase PostgreSQL
- 安全層: 結合 RLS 政策與自定義 JWT

### 實施步驟

1. 資料庫設計與 RLS 策略
    ```sql
    -- 用戶表結構
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        email TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 啟用 RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    -- 用戶只能查看和編輯自己的資料
    CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.jwt() ->> 'user_id' = id::text);

    CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.jwt() ->> 'user_id' = id::text);
    ```

    ```sql
    -- 課程表結構
    CREATE TABLE courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        date DATE NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        closed BOOLEAN DEFAULT FALSE
    );

    -- 啟用 RLS
    ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

    -- 政策：用戶能看到自己創建的課程
    CREATE POLICY "Users can CRUD own courses" ON courses
    FOR ALL USING (auth.jwt() ->> 'user_id' = created_by::text);
    ```


    ```sql
    -- 學生註冊表結構
    CREATE TABLE course_students (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        student_id UUID REFERENCES users(id),
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(course_id, student_id)
    );

    -- 啟用 RLS
    ALTER TABLE course_students ENABLE ROW LEVEL SECURITY;

    -- 政策：課程創建者可以管理所有學生註冊
    CREATE POLICY "Course creators can manage registrations" ON course_students
    FOR ALL USING (
        auth.jwt() ->> 'user_id' = (SELECT created_by FROM courses WHERE id = course_id)::text
    );
    
    -- 政策：學生可以查看自己的註冊
    CREATE POLICY "Students can view own registrations" ON course_students
    FOR SELECT USING (auth.jwt() ->> 'user_id' = student_id::text);
    ```
    
2. 自定義 JWT 實現
JWT 生成與解析工具 (lib/jwt.ts)

    ```typescript
    import jwt from 'jsonwebtoken';

    type JWTPayload = {
        user_id: string;
        email?: string;
        role: 'authenticated' | 'service_role';
        exp: number;
    }

    export function generateSupabaseJWT(userId: string, role: 'authenticated' | 'service_role' = 'authenticated'): string {
        const payload: JWTPayload = {
            user_id: userId,
            role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 小時有效期
        };
        
        return jwt.sign(
            payload, 
            process.env.SUPABASE_JWT_SECRET!,
            { algorithm: 'HS256' }
        );
    }

    export function verifySupabaseJWT(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as JWTPayload;
        } catch (error) {
            console.error('JWT 驗證失敗:', error);
            return null;
        }
    }
    ```

3. Supabase 客戶端工具
服務端客戶端 (utils/supabase/server.ts)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateSupabaseJWT } from '@/lib/jwt';

// 創建匿名客戶端
export async function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        }
      }
    }
  );
}

// 創建基於用戶身份的客戶端
export async function createAuthClient(userId: string) {
  const token = generateSupabaseJWT(userId);
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}
```

客戶端工具 (utils/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

4. NextAuth 集成
NextAuth 配置 (app/api/auth/[...nextauth]/route.ts)
```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAuth } from '@/lib/supabase-auth';
import { generateSupabaseJWT } from '@/lib/jwt';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;
      
      // 使用 Supabase 創建或驗證用戶
      const userId = await supabaseAuth(
        account.provider,
        account.providerAccountId
      );
      
      if (!userId) return false;
      
      // 將 userId 存儲到 user 物件中，以便在其他回調中使用
      user.id = userId;
      return true;
    },
    
    async jwt({ token, user }) {
      // 首次登入時，將 userId 添加到 token
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session?.user && token.userId) {
        // 添加用戶 ID 到 session
        session.user.id = token.userId as string;
        
        // 生成 Supabase JWT 並添加到 session
        session.supabaseToken = generateSupabaseJWT(token.userId as string);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
```

自定義 Supabase 身份驗證邏輯 (lib/supabase-auth.ts)
```typescript
import { createClient } from '@/utils/supabase/server';

export async function supabaseAuth(provider: string, providerAccountId: string): Promise<string | null> {
  const supabase = await createClient();
          
  try {
    // 1. 檢查用戶是否存在
    const { data: existingAuth, error: authCheckError } = await supabase
      .from("auth")
      .select('user_id')
      .eq("provider", provider)
      .eq("provider_id", providerAccountId)
      .single();

    if (authCheckError && authCheckError.code !== 'PGRST116') {
      console.error('檢查認證錯誤:', authCheckError);
      throw new Error('無法檢查登入狀態');
    }

    // 2a. 如果用戶已存在，直接返回 user_id
    if (existingAuth) {
      return existingAuth.user_id;
    }

    // 2b. 如果是新用戶，創建用戶並添加認證記錄
    const { data: newUserId, error: rpcError } = await supabase
      .rpc('create_user_and_auth', {
        p_provider: provider,
        p_provider_id: providerAccountId
      });

    if (rpcError) {
      console.error('RPC 錯誤:', rpcError);
      throw new Error('創建用戶失敗');
    }

    return newUserId;
  } catch (error) {
    console.error('Supabase 認證錯誤:', error);
    return null;
  }
} 
```

5. 資料存取層實現
創建 create_user_and_auth 函數
```sql
CREATE OR REPLACE FUNCTION create_user_and_auth(
  p_provider TEXT,
  p_provider_id TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 創建用戶記錄
  INSERT INTO users (id, name)
  VALUES (uuid_generate_v4(), 'New User')
  RETURNING id INTO v_user_id;
  
  -- 創建認證記錄
  INSERT INTO auth (user_id, provider, provider_id)
  VALUES (v_user_id, p_provider, p_provider_id);
  
  RETURN v_user_id;
END;
$$;
```

資料存取工具 (lib/data-access.ts)
```typescript
import { getServerSession } from 'next-auth/next';
import { createAuthClient } from '@/utils/supabase/server';

// 在伺服器組件中安全獲取數據
export async function getSecureData(table: string, query: any = {}) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    throw new Error('未授權存取');
  }
  
  // 創建有身份驗證的 Supabase 客戶端
  const supabase = await createAuthClient(session.user.id);
  
  // 執行資料庫查詢 - 會自動應用 RLS 政策
  const { data, error } = await supabase
    .from(table)
    .select(query.select || '*')
    .order(query.orderBy || 'created_at', { ascending: false });
    
  if (error) {
    console.error(`獲取 ${table} 數據錯誤:`, error);
    throw new Error(`無法獲取數據: ${error.message}`);
  }
  
  return data;
}

// 用於安全添加數據的函數
export async function addSecureData(table: string, data: any) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    throw new Error('未授權存取');
  }
  
  // 將 user_id 或 created_by 添加到數據中
  const dataWithUserId = {
    ...data,
    ...(table === 'users' ? { id: session.user.id } : { created_by: session.user.id })
  };
  
  const supabase = await createAuthClient(session.user.id);
  const { data: result, error } = await supabase
    .from(table)
    .insert(dataWithUserId)
    .select();
    
  if (error) {
    console.error(`添加 ${table} 數據錯誤:`, error);
    throw new Error(`無法添加數據: ${error.message}`);
  }
  
  return result;
}
```

6. 前端實現
TypeScript 類型定義 (types/next-auth.d.ts)
```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    supabaseToken?: string;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
```
客戶端資料獲取 Hook (hooks/use-secure-data.ts)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/utils/supabase/client';

export function useSecureData<T>(table: string, options = {}) {
  const { data: session } = useSession();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!session?.supabaseToken) {
      setLoading(false);
      return;
    }
    
    async function fetchData() {
      setLoading(true);
      
      try {
        const supabase = createClient();
        
        // 設置 Authorization 頭
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .authMode('jwt')
          .setAuthHeader(`Bearer ${session.supabaseToken}`);
          
        if (error) throw new Error(error.message);
        
        setData(result as T[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('未知錯誤'));
        console.error(`獲取 ${table} 數據時出錯:`, err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [table, session?.supabaseToken]);
  
  return { data, loading, error, reload: () => null };
}
```
7. 身份驗證中間件 (middleware.ts)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 排除不需要身份驗證的路徑
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/signin') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  // 檢查是否有有效的 JWT
  const token = await getToken({ req: request });
  
  // 如果沒有 token，重定向到登入頁面
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路徑除了:
     * - API 路由
     * - _next (Next.js 資源)
     * - ._next/static (靜態資源)
     * - ._next/image (圖片優化)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
```
測試與驗證
1. 用戶身份驗證流程測試
測試 Google 登入流程
確認正確生成 JWT 和 Session 對象
驗證未登入用戶重定向到登入頁面
2. 資料存取權限測試
確認用戶只能讀取自己的資料
測試無法修改其他用戶的課程
驗證課程創建者可以管理課程學生
3. 安全漏洞測試
嘗試使用過期 JWT
測試 SQL 注入防禦
測試 JWT 偽造攻擊的防護
部署注意事項
環境變數
```
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

資料庫初始化
在部署前，確保所有資料表和 RLS 政策已正確配置。
JWT 密鑰管理
確保 JWT 密鑰安全儲存且與 Supabase JWT 密鑰匹配。
結論
此實施方案將 NextAuth 與 Supabase 完美整合，實現用戶資料的安全隔離。通過 RLS 政策和自定義 JWT，系統既保持了 NextAuth 的便捷性，又獲得了 Supabase 的安全優勢。