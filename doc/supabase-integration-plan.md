# Supabase 整合開發計畫書

## 1. 初始設置
- 系統架構選擇
  - 評估不同架構方案
    - 完全分離方案（Google Auth + Supabase DB）
    - Supabase Auth + 自建資料庫
    - 自建認證 + Supabase 資料庫
    - Supabase 全包方案
  - 架構決策考量
    - 開發效率
    - 維護成本
    - 系統靈活性
    - 未來擴展性
  - 建議方案
    - 短期：採用完全分離方案
      - 保留現有 Google Auth
      - 使用 Supabase 資料庫
      - 建立用戶資料同步機制
    - 長期：評估遷移到 Supabase Auth
      - 待系統穩定後
      - 根據用戶反饋
      - 評估維護成本
- Vercel Supabase 專案建立
  - 使用 Vercel 儀表板創建 Supabase 整合
  - 連結 Vercel 與 Supabase 項目
- 環境變數設定 (.env.local)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (僅用於複雜操作，非必需)
- Supabase 客戶端初始化
  - 建立 client-side 客戶端 (主要使用)
  - 建立 server-side 客戶端 (用於複雜操作，視需求使用)
- 操作權限策略
  - 優先使用 client-side 操作配合 RLS
  - 僅在必要時使用 server-side 操作
  - 避免使用 service_role_key 進行一般 CRUD 操作

## 2. 認證系統遷移
- 保留現有 Google Auth 系統
  - 維持現有的 Google OAuth 流程
  - 保留現有的認證邏輯
  - 確保現有功能正常運作
- 認證系統抽象層設計
  - 建立 AuthService 介面
    - 定義標準認證方法（登入、登出、檢查狀態等）
    - 定義用戶資訊結構
    - 定義權限檢查方法
  - 實作 GoogleAuthService
    - 封裝現有的 Google OAuth 邏輯
    - 處理 token 和 session 管理
    - 提供統一的認證介面
  - 建立 AuthContext
    - 提供認證狀態管理
    - 提供認證方法
    - 處理認證狀態更新
- 現有系統調整
  - 重構 route.ts 以支援新的認證介面
  - 修改 userinfo 處理邏輯，統一用戶資訊結構
  - 更新 check 目錄下的 session 驗證邏輯
  - 修改 logout 處理方式
  - 更新 url 目錄下的重定向 URL 生成

## 3. 資料庫結構設計
- 資料表結構
  ```sql
  -- 用戶資料表
  create table profiles (
    id uuid references auth.users on delete cascade,
    google_uid text unique,  -- 儲存 Google 的 uid
    email text,
    name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
  );

  -- 課程表
  create table courses (
    id uuid default uuid_generate_v4() primary key,
    teacher_id text references profiles(google_uid),
    title text not null,
    description text,
    price decimal,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
  );

  -- 學員表
  create table students (
    id uuid default uuid_generate_v4() primary key,
    teacher_id text references profiles(google_uid),
    name text not null,
    email text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
  );

  -- 預約表
  create table bookings (
    id uuid default uuid_generate_v4() primary key,
    course_id uuid references courses(id),
    student_id uuid references students(id),
    teacher_id text references profiles(google_uid),
    booking_date timestamp with time zone,
    status text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
  );
  ```
- RLS (Row Level Security) 政策設定
  - 確保用戶只能訪問和修改自己的資料
  - 設計全面的安全政策支持客戶端直接操作
  - 詳細的 RLS 政策設計
    ```sql
    -- 用戶資料表
    create policy "Users can view own profile"
      on profiles for select
      using (google_uid = current_setting('request.jwt.claims')::json->>'sub');

    -- 課程表：老師只能管理自己的課程
    create policy "Teachers can manage own courses"
      on courses for all
      using (teacher_id = current_setting('request.jwt.claims')::json->>'sub');

    -- 學員表：老師只能管理自己課程的學員
    create policy "Teachers can manage own students"
      on students for all
      using (teacher_id = current_setting('request.jwt.claims')::json->>'sub');

    -- 預約表：老師只能管理自己課程的預約
    create policy "Teachers can manage own bookings"
      on bookings for all
      using (teacher_id = current_setting('request.jwt.claims')::json->>'sub');
    ```
  - RLS 政策說明
    - 使用 Google uid 作為權限識別
    - 自動檢查 JWT token 中的用戶身份
    - 確保老師只能存取自己的課程、學員和預約資料
    - 提供資料安全性保護
    - 所有資料表都關聯到老師的 profile

## 4. 客戶端架構 (主要使用)
- 直接使用 Supabase JS 客戶端進行操作
- 通過 RLS 確保資料安全
- 基本 CRUD 操作直接在客戶端執行
- 實時訂閱實現即時更新
- Google Auth 整合
  - 使用 Google token 進行 Supabase 操作
  - 確保 token 的有效性
  - 處理 token 過期的情況
- 避免不必要的 server-side 操作
  - 減少網路請求
  - 提高系統效能
  - 降低維護成本
  - 增強安全性

## 5. 伺服器端功能 (按需使用)
- 僅用於複雜業務邏輯和跨表操作
- 處理需要額外驗證的操作
- 批量資料處理
- 複雜報表生成
- 伺服器端操作注意事項
  - 嚴格限制使用場景
  - 詳細記錄操作日誌
  - 實施額外的安全檢查
  - 定期審查使用情況

## 6. 資料遷移策略
- 既有資料匯出計劃
- 資料轉換與清理
- 測試導入流程
- 生產環境轉移計劃

## 7. 前端整合
- React 鉤子 (Hooks) 開發
  - useSupabaseClient (主要使用)
  - useUser
  - useSession
- 資料狀態管理
- UI 元件適配
- 實時功能實現
  - 課程變更實時顯示
  - 預約狀態即時更新

## 8. 測試與部署
- 單元測試
- 整合測試
- Vercel 部署配置
  - 環境變數設置
  - 部署鉤子設定
  - 預覽部署設定
- 監控與告警設定

## 9. Vercel 特有整合功能
- Vercel Edge Config 與 Supabase 整合
- Vercel Serverless Functions 與 Supabase 互動 (僅用於複雜操作)
- Vercel Cron Jobs 自動化任務
- Vercel Analytics 整合

## 10. 功能實現優先順序
1. 用戶認證與身份管理
2. 學員資料管理
3. 課程與預約系統
4. 報表與分析功能

## 11. 客戶端優先架構的優勢
- 開發效率提高：減少 API 端點開發
- 用戶體驗改善：減少網絡請求和延遲
- 實時功能：直接使用 Supabase 實時訂閱
- 簡化部署：減少伺服器端維護成本
- 安全性保證：通過嚴格的 RLS 政策確保資料安全

## 12. 未來功能規劃
- Google Drive 整合 (未來功能)
  - 資料庫設計
    - 在 profiles 表中添加 Google Drive 相關欄位
    - 儲存 Google Drive 權限狀態
    - 記錄最後同步時間
  - 功能實現
    - 使用 Supabase 的 Google OAuth token
    - 實現資料匯出到 Google Drive
    - 處理權限請求和管理
  - 整合時機
    - 待基本功能穩定後
    - 用戶需求確認後
    - 系統架構優化後 