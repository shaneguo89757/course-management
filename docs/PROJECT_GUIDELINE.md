# Course Management System - Project Guideline

## 專案概述
這是一個基於 Next.js 的課程管理系統，提供課程管理、學生管理、認證等功能。系統採用現代化的技術棧和最佳實踐，確保可擴展性和維護性。

## 技術棧
- **前端框架**: Next.js 15.1.0
- **程式語言**: TypeScript
- **樣式解決方案**: Tailwind CSS
- **資料庫**: Supabase
- **狀態管理**: Zustand
- **UI 組件**: 
  - Radix UI (基礎組件)
  - shadcn/ui (預設 UI 組件)
- **表單處理**: React Hook Form + Zod
- **日期處理**: date-fns
- **圖表**: Recharts
- **開發工具**:
  - ESLint
  - PostCSS
  - TypeScript

## 目錄結構
```
├── app/                    # Next.js 應用程式主目錄
│   ├── api/               # API 路由
│   ├── auth/              # 認證相關頁面
│   ├── courses/           # 課程管理
│   ├── dashboard/         # 儀表板
│   └── students/          # 學生管理
├── components/            # 可重用 UI 組件
├── lib/                   # 工具函數和共享邏輯
├── hooks/                 # 自定義 React hooks
├── styles/               # 全局樣式
├── public/               # 靜態資源
└── scripts/              # 腳本文件
```

## 開發指南

### 環境設置
1. 確保已安裝 Node.js (建議版本 >= 18)
2. 安裝依賴：
   ```bash
   npm install
   # 或
   pnpm install
   ```
3. 設置環境變數：
   - 複製 `.env.example` 到 `.env.local`
   - 填入必要的環境變數

### 開發命令
- `npm run dev`: 啟動開發服務器
- `npm run build`: 構建生產版本
- `npm run start`: 啟動生產服務器
- `npm run lint`: 運行程式碼檢查

### 程式碼規範
1. **命名規範**
   - 組件檔案：PascalCase (例如：`UserProfile.tsx`)
   - 工具函數：camelCase (例如：`formatDate.ts`)
   - 常數：UPPER_SNAKE_CASE (例如：`MAX_ITEMS`)

2. **檔案組織**
   - 相關的組件和邏輯應放在同一目錄下
   - 使用 index.ts 檔案導出主要組件
   - 保持目錄結構清晰和模組化

3. **TypeScript**
   - 為所有組件和函數定義適當的型別
   - 避免使用 `any` 型別
   - 使用介面定義資料結構

4. **樣式指南**
   - 優先使用 Tailwind CSS 類別
   - 遵循響應式設計原則
   - 保持一致的設計語言

### Auth
#### 登入流程
1. 用戶點擊登入按鈕
2. 調用 GoogleAuthService.getAuthUrl() 獲取 Google 認證 URL
3. 重定向到 Google 登入頁面
4. 用戶授權後重定向回應用
5. 後端處理 OAuth code 並設置 cookie
6. 前端更新登入狀態

#### 登出流程
1. 用戶點擊登出按鈕
2. 調用 GoogleAuthService.logout()
3. 清除 cookie
4. 更新前端登入狀態

### 資料庫規範
1. **Supabase 表結構**
   - 使用有意義的表名和欄位名
   - 建立適當的索引
   - 實作資料驗證和約束

2. **API 設計**
   - 遵循 RESTful API 原則
   - 使用適當的 HTTP 方法
   - 實作錯誤處理和回應格式

### 版本控制
1. **Git 工作流程**
   - 使用有意義的提交訊息
   - 遵循分支命名規範
   - 定期同步主分支

2. **提交訊息格式**
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```

## 注意事項
1. 在開始新功能開發前，請先閱讀相關的現有程式碼
2. 確保所有新功能都有適當的錯誤處理
3. 保持程式碼的可測試性
4. 定期更新依賴套件
5. 遵循安全性最佳實踐

## 更新日誌
- 2024-03-25: 初始版本建立 