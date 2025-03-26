import { NextResponse } from "next/server"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import { createClient } from '@supabase/supabase-js'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// 創建 Supabase 管理員客戶端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SCOPES = [
  // "https://www.googleapis.com/auth/spreadsheets",
  // "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
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
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const userEmail = userInfo.data.email;
    const userName = userInfo.data.name;
    const userPicture = userInfo.data.picture;
    console.log("User email:", userEmail)

    if (!userEmail) {
      throw new Error("Failed to get user email")
    }
    
    // 在 Supabase 中創建或更新用戶
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: {
        name: userName,
        avatar_url: userPicture
      }
    })

    if (authError) {
      console.error("Supabase auth error:", authError)
      // 如果用戶已存在，嘗試更新用戶資訊
      const { data: existingUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser?.id || '',
        {
          user_metadata: {
            name: userName,
            avatar_url: userPicture
          }
        }
      )

      if (updateError) {
        throw updateError
      }
    }
    
    // 設置安全的 cookie
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("google_auth", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    // 設置用戶資訊到 cookie
    response.cookies.set("user_email", userEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // 設置 Supabase session
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: authUser?.id || existingUser?.id,
      expires_in: 60 * 60 * 24 * 7 // 7 days
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      throw sessionError
    }

    response.cookies.set("sb-access-token", session?.access_token || "", {
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