import { NextResponse } from "next/server"
import { oauth2Client, SCOPES } from "@/app/lib/google-auth"

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  })

  return NextResponse.json({ url: authUrl })
} 