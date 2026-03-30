'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Role } from '@/types'

// Data user statis untuk development (sebelum API autentikasi tersedia)
const STATIC_USERS: Record<string, User> = {
  guest: {
    id: 'guest-001',
    name: 'Pengunjung Demo',
    email: 'guest@demo.com',
    role: 'guest',
    phone: '081234567890',
  },
  owner: {
    id: 'owner-001',
    name: 'Pengelola Demo',
    email: 'owner@demo.com',
    role: 'owner',
    phone: '081234567891',
  },
  admin: {
    id: 'admin-001',
    name: 'Super Admin',
    email: 'admin@demo.com',
    role: 'admin',
    phone: '081234567892',
  },
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (role: Role) => void
  logout: () => void
  isGuest: boolean
  isOwner: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vs_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('vs_user')
      }
    }
  }, [])

  const login = (role: Role) => {
    const selectedUser = STATIC_USERS[role]
    setUser(selectedUser)
    localStorage.setItem('vs_user', JSON.stringify(selectedUser))
    // Token statis untuk development
    localStorage.setItem('vs_token', `static-token-${role}`)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vs_user')
    localStorage.removeItem('vs_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        isGuest: user?.role === 'guest',
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
