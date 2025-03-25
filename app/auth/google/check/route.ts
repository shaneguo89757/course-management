import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 401 })
  }
} 