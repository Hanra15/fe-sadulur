import apiClient from '@/lib/apiClient'
import { ApiResponse, User, PaginatedResponse } from '@/types'

export interface UserFormPayload {
  name: string
  email: string
  role: 'visitor' | 'owner' | 'admin'
  phone?: string
}

export interface CreateUserPayload extends UserFormPayload {
  password: string
}

export interface UserListParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

// Backend returns total_pages (not totalPages)
interface UserPaginatedRaw {
  status: string
  data: User[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export const userService = {
  getAll: async (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', { params })
    const raw = data as UserPaginatedRaw
    return {
      status: raw.status,
      data: raw.data,
      pagination: raw.pagination
        ? {
            total: raw.pagination.total,
            page: raw.pagination.page,
            limit: raw.pagination.limit,
            totalPages: raw.pagination.total_pages,
          }
        : undefined,
    }
  },

  getById: async (id: string | number): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get(`/users/${id}`)
    return data
  },

  create: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.post('/users', payload)
    return data
  },

  update: async (id: string | number, payload: Partial<UserFormPayload>): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.put(`/users/${id}`, payload)
    return data
  },

  resetPassword: async (id: string | number, newPassword: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.patch(`/users/${id}/password`, { new_password: newPassword })
    return data
  },

  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/users/${id}`)
    return data
  },
}
