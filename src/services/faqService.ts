import apiClient from '@/lib/apiClient'
import { ApiResponse, Faq } from '@/types'

export const faqService = {
  // GET /api/faqs — public; ?all=true (admin) shows all; ?category=X filters
  getAll: async (params?: { all?: boolean; category?: string }): Promise<{ data: Faq[]; grouped: Record<string, Faq[]> }> => {
    const { data } = await apiClient.get('/faqs', { params })
    return data
  },

  // GET /api/faqs/:id — admin
  getById: async (id: number): Promise<ApiResponse<Faq>> => {
    const { data } = await apiClient.get(`/faqs/${id}`)
    return data
  },

  // POST /api/faqs — admin
  create: async (payload: { question: string; answer: string; category?: string; order_index?: number; is_active?: boolean }): Promise<ApiResponse<Faq>> => {
    const { data } = await apiClient.post('/faqs', payload)
    return data
  },

  // PUT /api/faqs/:id — admin
  update: async (id: number, payload: { question?: string; answer?: string; category?: string; order_index?: number; is_active?: boolean }): Promise<ApiResponse<Faq>> => {
    const { data } = await apiClient.put(`/faqs/${id}`, payload)
    return data
  },

  // PATCH /api/faqs/:id/toggle — admin
  toggle: async (id: number): Promise<ApiResponse<Faq>> => {
    const { data } = await apiClient.patch(`/faqs/${id}/toggle`)
    return data
  },

  // PATCH /api/faqs/reorder — admin: [{ id, order_index }]
  reorder: async (items: { id: number; order_index: number }[]): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.patch('/faqs/reorder', items)
    return data
  },

  // DELETE /api/faqs/:id — admin
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/faqs/${id}`)
    return data
  },
}
