import apiClient from '@/lib/apiClient'
import { ApiResponse, Booking } from '@/types'

export const bookingService = {
  create: async (payload: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.post('/bookings', payload)
    return data
  },

  getMyBookings: async (): Promise<ApiResponse<Booking[]>> => {
    const { data } = await apiClient.get('/bookings/my')
    return data
  },

  getById: async (id: string | number): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.get(`/bookings/${id}`)
    return data
  },

  getByVilla: async (villaId: string | number): Promise<ApiResponse<Booking[]>> => {
    const { data } = await apiClient.get(`/bookings?villa_id=${villaId}`)
    return data
  },

  cancel: async (id: string | number): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.patch(`/bookings/${id}/cancel`)
    return data
  },
}
