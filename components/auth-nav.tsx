"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthNav() {
  const { data: session } = useSession();
  console.log(session);
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