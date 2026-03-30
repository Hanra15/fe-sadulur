import apiClient from '@/lib/apiClient'
import { ApiResponse, Review } from '@/types'

export const reviewService = {
  // POST /api/reviews - tambah review villa (visitor, perlu JWT)
  create: async (payload: {
    villa_id: string | number
    booking_id?: string | number
    rating: number
    comment: string
  }): Promise<ApiResponse<Review>> => {
    const { data } = await apiClient.post('/reviews', payload)
    return data
  },

  // GET /api/reviews/villa/:villaId - list review milik suatu villa (publik)
  getByVilla: async (villaId: string | number): Promise<ApiResponse<Review[]>> => {
    const { data } = await apiClient.get(`/reviews/villa/${villaId}`)
    return data
  },

  // DELETE /api/reviews/:id - hapus review (admin)
  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/reviews/${id}`)
    return data
  },
}
