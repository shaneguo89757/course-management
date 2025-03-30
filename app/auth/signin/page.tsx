"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail } from "lucide-react";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="h-8 w-8" />
            <CardTitle className="text-2xl">課程管理系統</CardTitle>
          </div>
          <CardDescription className="text-center">
            請選擇登入方式以繼續使用系統
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Mail className="mr-2 h-4 w-4" />
            使用 Google 帳號登入
          </Button>
          {/* 未來可以添加其他登入方式 */}
        </CardContent>
      </Card>
    </div>
  );
} 