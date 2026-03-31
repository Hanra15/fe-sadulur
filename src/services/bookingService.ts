import apiClient from '@/lib/apiClient'
import { ApiResponse, Booking } from '@/types'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'paid'

export const bookingService = {
  // POST /api/bookings (JWT optional - visitor)
  create: async (payload: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.post('/bookings', payload)
    return data
  },

  // GET /api/bookings - list booking user login
  getMyBookings: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ status: string; data: Booking[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }> => {
    const { data } = await apiClient.get('/bookings', { params })
    return data
  },

  // GET /api/bookings/all - semua booking (admin)
  getAllBookings: async (params?: Record<string, unknown>): Promise<ApiResponse<Booking[]>> => {
    const { data } = await apiClient.get('/bookings/all', { params })
    return data
  },

  // GET /api/bookings/:id
  getById: async (id: string | number): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.get(`/bookings/${id}`)
    return data
  },

  // PATCH /api/bookings/:id/status (owner, admin)
  updateStatus: async (id: string | number, status: BookingStatus): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.patch(`/bookings/${id}/status`, { status })
    return data
  },

  // DELETE /api/bookings/:id (owner, admin)
  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/bookings/${id}`)
    return data
  },
}
