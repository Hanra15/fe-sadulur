import apiClient from '@/lib/apiClient'
import { ApiResponse, Villa, VillaFilters, PaginatedResponse } from '@/types'

export interface CalendarEntry {
  date: string
  available: boolean
  note?: string
}

export interface VillaFormPayload {
  name: string
  location: string
  description: string
  price: number
  priceWeekend?: number
  capacity: number
  bedrooms?: number
  bathrooms?: number
  whatsapp?: string
  facilities?: string[]
  available?: boolean
  lat?: number
  lng?: number
  /** Existing image URLs to keep (from server) */
  imageUrls?: string[]
  /** New local File objects to upload */
  imageFiles?: File[]
  owner_id?: string | number
}

export const villaService = {
  getAll: async (filters?: VillaFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Villa>> => {
    const { data } = await apiClient.get('/villas', { params: filters })
    return data
  },

  getById: async (id: string | number): Promise<ApiResponse<Villa>> => {
    const { data } = await apiClient.get(`/villas/${id}`)
    return data
  },

  create: async (payload: VillaFormPayload): Promise<ApiResponse<Villa>> => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, val]) => {
      if (val === undefined || val === null) return
      if (key === 'imageFiles') return   // handled separately
      if (key === 'facilities' || key === 'imageUrls') {
        formData.append(key, JSON.stringify(val))
      } else {
        formData.append(key, String(val))
      }
    })
    if (payload.imageFiles?.length) {
      payload.imageFiles.forEach(file => formData.append('images', file))
    }
    const { data } = await apiClient.post('/villas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  update: async (id: string | number, payload: Partial<VillaFormPayload>): Promise<ApiResponse<Villa>> => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, val]) => {
      if (val === undefined || val === null) return
      if (key === 'imageFiles') return   // handled separately
      if (key === 'facilities' || key === 'imageUrls') {
        formData.append(key, JSON.stringify(val))
      } else {
        formData.append(key, String(val))
      }
    })
    if (payload.imageFiles?.length) {
      payload.imageFiles.forEach(file => formData.append('images', file))
    }
    const { data } = await apiClient.put(`/villas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/villas/${id}`)
    return data
  },

  getCalendar: async (id: string | number): Promise<ApiResponse<CalendarEntry[]>> => {
    const { data } = await apiClient.get(`/villas/${id}/calendar`)
    return data
  },

  updateCalendar: async (id: string | number, payload: CalendarEntry[]): Promise<ApiResponse<CalendarEntry[]>> => {
    const { data } = await apiClient.post(`/villas/${id}/calendar`, payload)
    return data
  },
}
