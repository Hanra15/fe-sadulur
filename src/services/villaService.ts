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
  /** Server image URLs to delete (sent as removeImages to backend) */
  removeImageUrls?: string[]
  owner_id?: string | number
}

export const villaService = {
  getAll: async (filters?: VillaFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Villa>> => {
    // Map frontend snake_case → backend camelCase param names
    const { min_price, max_price, ...rest } = filters ?? {}
    const params: Record<string, unknown> = { ...rest }
    if (min_price !== undefined) params.minPrice = min_price
    if (max_price !== undefined) params.maxPrice = max_price
    const { data } = await apiClient.get('/villas', { params })
    return data
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Villa>> => {
    const { data } = await apiClient.get(`/villas/${slug}`)
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

  update: async (slug: string, payload: Partial<VillaFormPayload>): Promise<ApiResponse<Villa>> => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, val]) => {
      if (val === undefined || val === null) return
      // These are handled separately below
      if (key === 'imageFiles' || key === 'removeImageUrls') return
      if (key === 'facilities') {
        formData.append(key, JSON.stringify(val))
      } else if (key === 'imageUrls') {
        // Not used on update — backend ignores it; we use removeImageUrls instead
        return
      } else {
        formData.append(key, String(val))
      }
    })
    // Append each new file
    if (payload.imageFiles?.length) {
      payload.imageFiles.forEach(file => formData.append('images', file))
    }
    // Tell backend which existing images to delete
    if (payload.removeImageUrls?.length) {
      payload.removeImageUrls.forEach(url => formData.append('removeImages', url))
    }
    const { data } = await apiClient.put(`/villas/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  delete: async (slug: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/villas/${slug}`)
    return data
  },

  getCalendar: async (slug: string): Promise<ApiResponse<CalendarEntry[]>> => {
    const { data } = await apiClient.get(`/villas/${slug}/calendar`)
    return data
  },

  updateCalendar: async (slug: string, payload: CalendarEntry[]): Promise<ApiResponse<CalendarEntry[]>> => {
    const { data } = await apiClient.post(`/villas/${slug}/calendar`, payload)
    return data
  },
}
