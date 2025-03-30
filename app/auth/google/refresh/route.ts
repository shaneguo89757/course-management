import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/app/lib/google-auth';

export async function POST() {
  console.log("====>Refresh: Starting token refresh");
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    console.log("====>Refresh: No auth cookie found");
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(authCookie.value);
    
    if (!tokens.refresh_token) {
      console.log("====>Refresh: No refresh token found");
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    console.log("====>Refresh: Attempting to refresh token");
    // 設置 refresh token
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token
    });

    // 獲取新的 access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log("====>Refresh: Got new access token");
    
    // 更新 token 資訊
    const updatedTokens = {
      ...tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    };

    console.log("====>Refresh: New token expiry:", updatedTokens.expiry_date);

    // 更新 cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(updatedTokens), COOKIE_OPTIONS);

    console.log("====>Refresh: Token refresh completed successfully");
    return response;
  } catch (error) {
    console.error("====>Refresh: Token refresh error:", error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
} 