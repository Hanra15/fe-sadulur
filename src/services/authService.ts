/**
 * authService — Skema autentikasi via API.
 * Saat ini login dilakukan secara statis (role-based).
 * Siap diintegrasikan dengan endpoint backend saat tersedia.
 */

import apiClient from '@/lib/apiClient'
import { ApiResponse, User } from '@/types'

export const authService = {
  // Akan digunakan saat backend siap
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  register: async (payload: {
    name: string
    email: string
    password: string
    phone?: string
    role?: string
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get('/auth/profile')
    return data
  },
}
