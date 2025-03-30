import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { google } from "googleapis"
import { oauth2Client, AUTH_COOKIE_NAME } from "@/app/lib/google-auth"

export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)

  if (!authCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const tokens = JSON.parse(authCookie.value)
    
    if (!tokens.access_token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    oauth2Client.setCredentials(tokens)
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    
    return NextResponse.json({
      name: userInfo.data.name,
      email: userInfo.data.email,
      picture: userInfo.data.picture
    })
  } catch (error) {
    console.error("Error fetching user info:", error)
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 })
  }
} 