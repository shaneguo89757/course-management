"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { GoogleAuthService } from "@/lib/services/googleAuth"

type UserInfo = {
  name?: string
  email?: string
  picture?: string
}

type AuthContextType = {
  isAuthorized: boolean
  isLoading: boolean
  userInfo: UserInfo | null
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const refreshUserInfo = async () => {
    if (isAuthorized) {
      try {
        const info = await GoogleAuthService.getUserInfo()
        setUserInfo(info)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    } else {
      setUserInfo(null)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await GoogleAuthService.isAuthorized()
        setIsAuthorized(status)
        if (status) {
          await refreshUserInfo()
        }
      } catch (error) {
        console.error("Auth status check error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const login = async () => {
    try {
      const authUrl = await GoogleAuthService.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await GoogleAuthService.logout()
      setIsAuthorized(false)
      setUserInfo(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthorized, isLoading, userInfo, login, logout, refreshUserInfo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 