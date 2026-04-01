import apiClient from '@/lib/apiClient'
import { ApiResponse, SupportTicket, SupportMessage } from '@/types'

export interface SupportListParams {
  status?: string
  category?: string
  priority?: string
  page?: number
  limit?: number
}

export const supportService = {
  // GET /api/support — own tickets (visitor) or all (admin)
  getAll: async (params?: SupportListParams): Promise<{ data: SupportTicket[]; meta?: { total: number; page: number; limit: number } }> => {
    const { data } = await apiClient.get('/support', { params })
    return data
  },

  // GET /api/support/:ticketCode — public, returns ticket + messages
  getByCode: async (ticketCode: string): Promise<ApiResponse<SupportTicket>> => {
    const { data } = await apiClient.get(`/support/${ticketCode}`)
    return data
  },

  // POST /api/support — public, create ticket
  create: async (payload: {
    name: string
    email: string
    subject: string
    message: string
    category?: string
    priority?: string
  }): Promise<{ status: string; ticket_code: string; ticket_id: number; message: string }> => {
    const { data } = await apiClient.post('/support', payload)
    return data
  },

  // POST /api/support/:ticketCode/reply — auth
  reply: async (ticketCode: string, payload: { message: string; is_internal?: boolean }): Promise<ApiResponse<SupportMessage>> => {
    const { data } = await apiClient.post(`/support/${ticketCode}/reply`, payload)
    return data
  },

  // PATCH /api/support/:ticketCode — admin/owner; update status/priority/assigned_to
  update: async (ticketCode: string, payload: { status?: string; priority?: string; assigned_to?: number; note?: string }): Promise<ApiResponse<SupportTicket>> => {
    const { data } = await apiClient.patch(`/support/${ticketCode}`, payload)
    return data
  },

  // DELETE /api/support/:ticketCode — admin
  delete: async (ticketCode: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/support/${ticketCode}`)
    return data
  },
}
