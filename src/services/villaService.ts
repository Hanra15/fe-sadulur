import apiClient from '@/lib/apiClient'
import { ApiResponse, Villa, VillaFilters } from '@/types'

export const villaService = {
  getAll: async (filters?: VillaFilters): Promise<ApiResponse<Villa[]>> => {
    const { data } = await apiClient.get('/villas', { params: filters })
    return data
  },

  getById: async (id: string | number): Promise<ApiResponse<Villa>> => {
    const { data } = await apiClient.get(`/villas/${id}`)
    return data
  },

  create: async (payload: Partial<Villa>): Promise<ApiResponse<Villa>> => {
    const { data } = await apiClient.post('/villas', payload)
    return data
  },

  update: async (id: string | number, payload: Partial<Villa>): Promise<ApiResponse<Villa>> => {
    const { data } = await apiClient.put(`/villas/${id}`, payload)
    return data
  },

  delete: async (id: string | number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/villas/${id}`)
    return data
  },
}
