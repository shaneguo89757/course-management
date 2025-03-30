import { OAuth2Client } from 'google-auth-library';

// 創建一個共用的 OAuth2Client 實例
export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 定義共用的 scope
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// 定義 cookie 名稱
export const AUTH_COOKIE_NAME = 'google_auth';

// 定義共用的 cookie 選項
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 // 7 days
}; 