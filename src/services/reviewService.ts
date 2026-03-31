import apiClient from '@/lib/apiClient'
import { ApiResponse, Review, PaginatedResponse } from '@/types'

export interface ReviewListParams {
  page?: number
  limit?: number
  villa_id?: string | number
  user_id?: string | number
  rating?: number
}

interface ReviewPaginatedRaw {
  status: string
  data: Review[]
  pagination: { total: number; page: number; limit: number; total_pages: number }
}

export const reviewService = {
  // GET /api/reviews — admin only, semua review dengan filter
  getAll: async (params?: ReviewListParams): Promise<PaginatedResponse<Review>> => {
    const { data } = await apiClient.get('/reviews', { params })
    const raw = data as ReviewPaginatedRaw
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

  // GET /api/reviews/:id — admin only, detail review + reviewer + villa
  getById: async (id: string | number): Promise<ApiResponse<Review>> => {
    const { data } = await apiClient.get(`/reviews/${id}`)
    return data
  },

  // POST /api/reviews — tambah review villa (visitor, perlu JWT)
  create: async (payload: {
    villa_id: string | number
    booking_id?: string | number
    rating: number
    comment: string
  }): Promise<ApiResponse<Review>> => {
    const { data } = await apiClient.post('/reviews', payload)
    return data
  },

  // GET /api/reviews/villa/:villaId — list review milik suatu villa (publik)
  getByVilla: async (villaId: string | number): Promise<ApiResponse<Review[]>> => {
    const { data } = await apiClient.get(`/reviews/villa/${villaId}`)
    return data
  },

  // DELETE /api/reviews/:id — hapus review (admin)
  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/reviews/${id}`)
    return data
  },
}

