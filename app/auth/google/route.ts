import { NextResponse } from "next/server"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

const SCOPES = [
  // "https://www.googleapis.com/auth/spreadsheets",
  // "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // 設置 token 到 client
    oauth2Client.setCredentials(tokens)
    
    // 獲取用戶資訊
    /**
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const userEmail = userInfo.data.email;
    const userName = userInfo.data.name;
    console.log("User email:", userEmail)
    console.log("User name:", userName)

    if (!userEmail) {
      throw new Error("Failed to get user email")
    }
    */
    
    // 設置安全的 cookie
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("google_auth", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Google auth success:", response)

    return response
  } catch (error) {
    console.error("Google auth error:", error)
    // 如果認證失敗，重定向到錯誤頁面或顯示錯誤訊息
    return NextResponse.redirect(new URL("/auth/error", request.url))
  }
} 