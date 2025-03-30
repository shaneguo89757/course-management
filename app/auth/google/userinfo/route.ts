import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("google_auth")

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