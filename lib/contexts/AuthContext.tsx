"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { GoogleAuthService } from "@/lib/services/googleAuth"

type AuthContextType = {
  isAuthorized: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await GoogleAuthService.isAuthorized()
        setIsAuthorized(status)
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
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthorized, isLoading, login, logout }}>
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