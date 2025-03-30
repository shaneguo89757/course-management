import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "@/app/lib/google-auth"
import { cookies } from "next/headers";

export async function POST() {
   try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ success: true });
   } catch (error) {
    console.error("Logout failed:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
   }
} 