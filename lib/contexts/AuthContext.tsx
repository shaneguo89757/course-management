"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { GoogleAuthService } from "@/lib/services/googleAuth"
import { createClient } from '@supabase/supabase-js'

type AuthContextType = {
  isAuthorized: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  user: any | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 創建 Supabase 客戶端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 檢查 Supabase session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth check error:", error)
          setIsAuthorized(false)
        } else {
          setIsAuthorized(!!session)
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error("Auth status check error:", error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthorized(!!session)
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
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
      // 登出 Supabase
      await supabase.auth.signOut()
      // 登出 Google
      await GoogleAuthService.logout()
      setIsAuthorized(false)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthorized, isLoading, login, logout, user }}>
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