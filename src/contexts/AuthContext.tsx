'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Role, RegisterPayload } from '@/types'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateProfile: (payload: Partial<User> & { password?: string }) => Promise<void>
  isGuest: boolean
  isOwner: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifikasi sesi saat app mount via GET /auth/me
  const restoreSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem('vs_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await authService.getMe()
      if (res.data) {
        setUser(res.data)
        localStorage.setItem('vs_user', JSON.stringify(res.data))
      }
    } catch {
      // Token tidak valid — bersihkan
      localStorage.removeItem('vs_token')
      localStorage.removeItem('vs_user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = async (email: string, password: string) => {
    // Response: { status, token, user } — flat, bukan ApiResponse<{token,user}>
    const res = await authService.login(email, password)
    localStorage.setItem('vs_token', res.token)
    localStorage.setItem('vs_user', JSON.stringify(res.user))
    setUser(res.user)
  }

  const register = async (payload: RegisterPayload) => {
    // Response: { status, token, user } — flat
    const res = await authService.register(payload)
    localStorage.setItem('vs_token', res.token)
    localStorage.setItem('vs_user', JSON.stringify(res.user))
    setUser(res.user)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vs_token')
    localStorage.removeItem('vs_user')
  }

  const updateProfile = async (payload: Partial<User> & { password?: string }) => {
    const res = await authService.updateProfile(payload)
    setUser(res.data)
    localStorage.setItem('vs_user', JSON.stringify(res.data))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        // visitor = pengunjung biasa (same as guest)
        isGuest: user?.role === 'guest' || user?.role === 'visitor',
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}

// Helper: role → dashboard path
export function getDashboardPath(role?: Role): string {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'owner') return '/dashboard/owner'
  return '/dashboard/guest'
}
