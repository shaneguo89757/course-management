"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { isAuthorized, isLoading, userInfo, refreshUserInfo } = useAuth()
  const router = useRouter()
  const [infoRequested, setInfoRequested] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/")
    } else if (isAuthorized && !infoRequested) {
      refreshUserInfo()
      setInfoRequested(true)
    }
  }, [isAuthorized, isLoading, router, infoRequested]);

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="個人資訊" />
        <div className="flex justify-center items-center h-64">
          <p>載入中...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="個人資訊" description="您的Google帳號資訊" />
      
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            {userInfo?.picture ? (
              <AvatarImage src={userInfo.picture} alt={userInfo.name || "用戶頭像"} />
            ) : (
              <AvatarFallback>{userInfo?.name?.[0] || "U"}</AvatarFallback>
            )}
          </Avatar>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">稱呼</h3>
            <p className="text-lg font-medium">{userInfo?.name || "未提供"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">電子郵件</h3>
            <p className="text-lg font-medium">{userInfo?.email || "未提供"}</p>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
} 