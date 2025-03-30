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
- [ ] Token 刷新機制
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