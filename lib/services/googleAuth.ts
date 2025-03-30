export class GoogleAuthService {
  static async getAuthUrl(): Promise<string> {
    const response = await fetch("/auth/google/url")
    if (!response.ok) {
      throw new Error("Failed to get auth URL")
    }
    const data = await response.json()
    return data.url
  }

  static async isAuthorized(): Promise<boolean> {
    try {
      const response = await fetch("/auth/google/check")
      if (!response.ok) {
        return false
      }
      const data = await response.json()
      return data.authenticated === true
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    }
  }

  static async getUserInfo() {
    try {
      const response = await fetch("/auth/google/userinfo")
      if (!response.ok) {
        throw new Error("Failed to get user info")
      }
      return await response.json()
    } catch (error) {
      console.error("User info error:", error)
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      const response = await fetch("/auth/google/logout", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to logout")
      }
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }
} 