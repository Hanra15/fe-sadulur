import apiClient from '@/lib/apiClient'
import { ApiResponse, Payment } from '@/types'

export const paymentService = {
  // POST /api/payments - buat pembayaran untuk booking
  create: async (payload: {
    booking_id: string | number
    method?: string
  }): Promise<ApiResponse<Payment>> => {
    const { data } = await apiClient.post('/payments', payload)
    return data
  },

  // GET /api/payments/:id - detail pembayaran
  getById: async (id: string | number): Promise<ApiResponse<Payment>> => {
    const { data } = await apiClient.get(`/payments/${id}`)
    return data
  },

  // GET /api/payments/booking/:bookingId - cek status pembayaran booking
  getByBookingId: async (bookingId: string | number): Promise<ApiResponse<Payment>> => {
    const { data } = await apiClient.get(`/payments/booking/${bookingId}`)
    return data
  },
}
