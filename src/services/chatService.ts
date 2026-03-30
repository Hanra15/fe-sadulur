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

  // POST /api/chats - kirim pesan (bisa membuat chat baru atau reply ke chat existing)
  sendMessage: async (payload: {
    chat_id?: string | number
    villa_id?: string | number
    message: string
  }): Promise<ApiResponse<ChatMessage>> => {
    const { data } = await apiClient.post('/chats', payload)
    return data
  },
}
