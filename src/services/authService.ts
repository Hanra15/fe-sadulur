/**
 * authService — Skema autentikasi via API.
 * Saat ini login dilakukan secara statis (role-based).
 * Siap diintegrasikan dengan endpoint backend saat tersedia.
 */

import apiClient from '@/lib/apiClient'
import { ApiResponse, User, RegisterPayload } from '@/types'

// Format response login/register: flat (token & user di root, bukan di .data)
export interface AuthResponse {
  status: string
  message?: string
  token: string
  user: User
}

export const authService = {
  // POST /api/auth/login → { status, token, user }
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  // POST /api/auth/register → { status, token, user }
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },

  // GET /api/auth/me → { status, data: User }
  getMe: async (): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  // PUT /api/auth/profile → { status, data: User }
  updateProfile: async (payload: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.put('/auth/profile', payload)
    return data
  },
}
