import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/app/lib/google-auth';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(authCookie.value);

    // 檢查 token 是否過期
    if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
      console.log('====>Check: Token has expired');
      return NextResponse.json({ 
        error: 'Token expired',
        needsRefresh: true 
      }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('====>Check: Error checking token:', error);
    return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
  }
} 