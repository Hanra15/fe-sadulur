import apiClient from '@/lib/apiClient'
import { ApiResponse, Testimonial } from '@/types'

export const testimonialService = {
  // GET /api/testimonials — public (active only); ?all=true for admin (all records)
  getAll: async (all?: boolean): Promise<{ status: string; data: Testimonial[]; total: number }> => {
    const { data } = await apiClient.get('/testimonials', { params: all ? { all: 'true' } : {} })
    return data
  },

  // GET /api/testimonials/:id — admin
  getById: async (id: number): Promise<ApiResponse<Testimonial>> => {
    const { data } = await apiClient.get(`/testimonials/${id}`)
    return data
  },

  // POST /api/testimonials — admin, multipart/form-data with optional photo
  create: async (formData: FormData): Promise<ApiResponse<Testimonial>> => {
    const { data } = await apiClient.post('/testimonials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // PUT /api/testimonials/:id — admin, multipart/form-data
  update: async (id: number, formData: FormData): Promise<ApiResponse<Testimonial>> => {
    const { data } = await apiClient.put(`/testimonials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // PATCH /api/testimonials/:id/toggle — admin, toggle is_active
  toggle: async (id: number): Promise<ApiResponse<{ id: number; is_active: boolean }>> => {
    const { data } = await apiClient.patch(`/testimonials/${id}/toggle`)
    return data
  },

  // DELETE /api/testimonials/:id — admin
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/testimonials/${id}`)
    return data
  },
}
