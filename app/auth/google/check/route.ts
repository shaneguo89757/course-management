import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client, AUTH_COOKIE_NAME } from '@/app/lib/google-auth';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(authCookie.value);
    console.log('====>Check: Current time:', Date.now());
    console.log('====>Check: Token expiry:', tokens.expiry_date);

    // 檢查 token 是否過期
    if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
      console.log('====>Check: Token has expired');
      // Token 已過期，需要刷新
      return NextResponse.json({ 
        error: 'Token expired',
        needsRefresh: true 
      }, { status: 401 });
    }

    console.log('====>Check: Token is still valid');
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('====>Check: Error parsing token:', error);
    return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
  }
} 