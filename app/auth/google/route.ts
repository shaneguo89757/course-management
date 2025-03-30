import { NextResponse } from "next/server"
import { oauth2Client, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/app/lib/google-auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    const { tokens } = await oauth2Client.getToken(code)
    
    // 確保有 refresh token
    if (!tokens.refresh_token) {
      throw new Error("No refresh token provided")
    }

    // 儲存完整的 token 資訊
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
      id_token: tokens.id_token
    }

    // 設置安全的 cookie
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(tokenData), COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error("Google auth error:", error)
    // 如果認證失敗，重定向到錯誤頁面或顯示錯誤訊息
    return NextResponse.redirect(new URL("/auth/error", request.url))
  }
} 