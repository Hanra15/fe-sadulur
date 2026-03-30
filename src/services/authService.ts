/**
 * authService — Skema autentikasi via API.
 * Saat ini login dilakukan secara statis (role-based).
 * Siap diintegrasikan dengan endpoint backend saat tersedia.
 */

import apiClient from '@/lib/apiClient'
import { ApiResponse, User, RegisterPayload } from '@/types'

export const authService = {
  // POST /api/auth/login
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  // POST /api/auth/register
  register: async (payload: RegisterPayload): Promise<ApiResponse<{ token: string; user: User }>> => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },

  // GET /api/auth/me
  getMe: async (): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  // PUT /api/users/profile
  updateProfile: async (payload: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.put('/users/profile', payload)
    return data
  },
}
