import apiClient from '@/lib/apiClient'
import { ApiResponse, Chat, ChatMessage } from '@/types'

export const chatService = {
  // GET /api/chats - list chat user login
  getMyChats: async (): Promise<ApiResponse<Chat[]>> => {
    const { data } = await apiClient.get('/chats')
    return data
  },

  // GET /api/chats/:id - detail chat beserta pesan
  getById: async (id: string | number): Promise<ApiResponse<Chat>> => {
    const { data } = await apiClient.get(`/chats/${id}`)
    return data
  },

  // POST /api/chats — receiver_id + message wajib, villa_id + booking_id opsional
  sendMessage: async (payload: {
    receiver_id: string | number
    message: string
    villa_id?: string | number
    booking_id?: string | number
  }): Promise<ApiResponse<ChatMessage>> => {
    const { data } = await apiClient.post('/chats', payload)
    return data
  },
}
