"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthNav() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span>歡迎, {session.user?.name}</span>
        <Button variant="outline" onClick={() => signOut()}>
          登出
        </Button>
      </div>
    );
  }

  return (
    // 需要多種登入方式選擇時, 請改成 signIn()
    <Button onClick={() => signIn("google")}>
      登入
    </Button>
  );
} 