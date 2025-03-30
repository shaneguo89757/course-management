import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "@/app/lib/google-auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // 清除 cookie
  response.cookies.delete(AUTH_COOKIE_NAME)
  
  return response
} 