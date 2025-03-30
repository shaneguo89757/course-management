# Google Auth 實現說明

## 目錄結構
```
app/
└── auth/
    └── google/
        ├── route.ts              # 處理 Google OAuth 回調
        ├── url/                  # 生成認證 URL
        │   └── route.ts
        ├── userinfo/            # 獲取用戶資訊
        │   └── route.ts
        ├── check/               # 檢查認證狀態
        │   └── route.ts
        ├── refresh/             # 處理 token 刷新
        │   └── route.ts
        └── logout/              # 處理登出
            └── route.ts
```

## 檔案說明
- `route.ts`: 主要的認證處理邏輯，包含：
  - 接收 OAuth 回調
  - 處理認證碼
  - 獲取 access token
  - 設置認證 cookie

- `url/route.ts`: 生成 Google 認證 URL，包含：
  - OAuth2 客戶端設定
  - Scope 設定
  - 認證 URL 生成

- `userinfo/route.ts`: 獲取用戶資訊，包含：
  - 使用 access token 獲取用戶資料
  - 處理用戶資訊
  - 錯誤處理

- `check/route.ts`: 檢查認證狀態，包含：
  - Cookie 檢查
  - Token 驗證
  - 狀態回報

- `refresh/route.ts`: 處理 token 刷新，包含：
  - 更新 token 資訊
  - 設置新的認證 cookie

- `logout/route.ts`: 處理登出，包含：
  - Cookie 清除
  - 登出處理

## 已實現功能

### 1. 基本認證流程
- [x] 生成認證 URL (`/auth/google/url`)
  - 使用正確的 OAuth2 設定
  - 包含必要的 scope
  - 支援離線存取

- [x] 處理認證回調 (`/auth/google/route.ts`)
  - 接收認證碼
  - 獲取 access token
  - 設置安全的 cookie

- [x] 用戶資訊獲取 (`/auth/google/userinfo`)
  - 獲取用戶基本資訊
  - 包含 name、email、picture
  - 錯誤處理機制

### 2. 認證狀態管理
- [x] 認證狀態檢查 (`/auth/google/check`)
  - 檢查 cookie 存在
  - 驗證 token 有效性
  - 返回認證狀態

- [x] 登出功能 (`/auth/google/logout`)
  - 清除認證 cookie
  - 簡單的登出處理

### 3. 安全性實現
- [x] 安全的 cookie 設定
  - httpOnly
  - secure (生產環境)
  - sameSite
  - 適當的過期時間

- [x] 錯誤處理
  - 認證失敗處理
  - Token 無效處理
  - 網路錯誤處理

## 待實現功能

### 1. Token 管理
- [x] Token 刷新機制
  - 處理 access token 過期
  - 使用 refresh token 更新
  - 自動更新機制

- [ ] Token 驗證增強
  - 檢查 token 過期時間
  - 提前更新機制
  - Token 狀態追蹤

### 2. 用戶管理
- [ ] 用戶資料同步
  - 定期更新用戶資訊
  - 處理用戶資訊變更
  - 資料一致性檢查

- [ ] 用戶權限管理
  - 角色基礎存取控制
  - 權限等級設定
  - 權限檢查機制

### 3. 安全性增強
- [ ] 認證狀態持久化
  - 資料庫儲存
  - 多裝置同步
  - 登入歷史記錄

- [ ] 安全性監控
  - 異常登入檢測
  - 活動日誌記錄
  - 安全警報機制

### 4. 整合功能
- [ ] 與 Supabase 整合
  - 用戶資料同步
  - 權限映射
  - 認證狀態同步

- [ ] 錯誤處理增強
  - 詳細的錯誤訊息
  - 錯誤追蹤機制
  - 自動恢復機制

## 建議優先實現項目

1. Token 刷新機制
   - 確保用戶不會因為 token 過期而需要重新登入
   - 提供更好的用戶體驗

2. 用戶權限管理
   - 支援不同角色的用戶
   - 實現基本的權限控制

3. 認證狀態持久化
   - 確保用戶資料的可靠性
   - 支援多裝置使用

4. 與 Supabase 整合
   - 實現資料同步
   - 確保系統一致性

## Token 刷新機制實現計劃

### 1. 檔案結構更新
```
app/
└── auth/
    └── google/
        ├── route.ts              # 處理 Google OAuth 回調
        ├── url/                  # 生成認證 URL
        │   └── route.ts
        ├── userinfo/            # 獲取用戶資訊
        │   └── route.ts
        ├── check/               # 檢查認證狀態
        │   └── route.ts
        ├── refresh/             # 處理 token 刷新
        │   └── route.ts
        └── logout/              # 處理登出
            └── route.ts
```

### 2. 實現步驟

#### 2.1 修改 OAuth 設定
```typescript
// url/route.ts
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "offline"  // 確保獲取 refresh token
];

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  return NextResponse.json({ url: authUrl });
}
```

#### 2.2 更新 Token 儲存
```typescript
// route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // 確保有 refresh token
    if (!tokens.refresh_token) {
      throw new Error("No refresh token provided");
    }

    // 儲存完整的 token 資訊
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
      id_token: tokens.id_token
    };

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("google_auth", JSON.stringify(tokenData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}
```

#### 2.3 實現 Token 刷新
```typescript
// refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("google_auth");

  if (!authCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(authCookie.value);
    
    if (!tokens.refresh_token) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 設置 refresh token
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token
    });

    // 獲取新的 access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // 更新 token 資訊
    const updatedTokens = {
      ...tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    };

    // 更新 cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("google_auth", JSON.stringify(updatedTokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
```

#### 2.4 更新認證檢查
```typescript
// check/route.ts
export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("google_auth");

  if (!authCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(authCookie.value);
    
    // 檢查 token 是否過期
    if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
      // Token 已過期，需要刷新
      return NextResponse.json({ 
        error: "Token expired",
        needsRefresh: true 
      }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
  }
}
```

### 3. 客戶端整合
```typescript
// 在客戶端處理 token 刷新
async function handleAuthCheck() {
  const response = await fetch('/auth/google/check');
  const data = await response.json();

  if (data.error === "Token expired" && data.needsRefresh) {
    // 嘗試刷新 token
    const refreshResponse = await fetch('/auth/google/refresh', {
      method: 'POST'
    });
    
    if (!refreshResponse.ok) {
      // 刷新失敗，需要重新登入
      window.location.href = '/auth/login';
      return;
    }
  }
}
```

### 4. 實現注意事項
1. **安全性考慮**
   - 確保 refresh token 安全儲存
   - 使用 httpOnly cookie
   - 實作適當的錯誤處理

2. **效能優化**
   - 在 token 即將過期時提前刷新
   - 避免不必要的刷新請求
   - 實作請求佇列避免重複刷新

3. **錯誤處理**
   - 處理網路錯誤
   - 處理 token 無效情況
   - 提供適當的錯誤訊息

4. **測試計劃**
   - 單元測試 token 刷新邏輯
   - 整合測試認證流程
   - 錯誤情況測試

### 5. 後續優化
1. **自動刷新機制**
   - 實作定期檢查
   - 提前刷新機制
   - 多裝置同步

2. **監控與日誌**
   - 記錄刷新事件
   - 追蹤失敗情況
   - 效能監控

3. **用戶體驗**
   - 無縫的刷新過程
   - 適當的錯誤提示
   - 自動重試機制 