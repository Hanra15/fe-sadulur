import apiClient from '@/lib/apiClient'
import { ApiResponse, LiveChatSession, LiveChatMessage, BotKnowledge } from '@/types'

export const livechatService = {
  // POST /api/livechat/sessions — public; starts bot session
  startSession: async (payload?: { visitor_name?: string; visitor_email?: string }): Promise<{
    status: string
    session_token: string
    session_id: number
    session_status: string
    messages: LiveChatMessage[]
  }> => {
    const { data } = await apiClient.post('/livechat/sessions', payload || {})
    return data
  },

  // GET /api/livechat/sessions — admin/owner
  getSessions: async (params?: { status?: string }): Promise<ApiResponse<LiveChatSession[]>> => {
    const { data } = await apiClient.get('/livechat/sessions', { params })
    return data
  },

  // GET /api/livechat/sessions/:token — public by token
  getSession: async (token: string): Promise<{
    status: string
    session: LiveChatSession
    messages: LiveChatMessage[]
  }> => {
    const { data } = await apiClient.get(`/livechat/sessions/${token}`)
    return data
  },

  // POST /api/livechat/sessions/:token/messages — visitor sends message
  sendMessage: async (token: string, message: string): Promise<{
    status: string
    visitorMessage: LiveChatMessage
    botReply?: LiveChatMessage
    sessionStatus: string
  }> => {
    const { data } = await apiClient.post(`/livechat/sessions/${token}/messages`, { message })
    return data
  },

  // POST /api/livechat/sessions/:token/admin-reply — admin
  adminReply: async (token: string, message: string): Promise<ApiResponse<LiveChatMessage>> => {
    const { data } = await apiClient.post(`/livechat/sessions/${token}/admin-reply`, { message })
    return data
  },

  // PATCH /api/livechat/sessions/:token/close — close session
  closeSession: async (token: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.patch(`/livechat/sessions/${token}/close`)
    return data
  },

  // ---- Bot Knowledge ----

  // GET /api/livechat/knowledge — admin
  getKnowledge: async (): Promise<ApiResponse<BotKnowledge[]>> => {
    const { data } = await apiClient.get('/livechat/knowledge')
    return data
  },

  // POST /api/livechat/knowledge — admin
  createKnowledge: async (payload: {
    intent: string
    keywords: string
    response: string
    order_index?: number
    is_active?: boolean
  }): Promise<ApiResponse<BotKnowledge>> => {
    const { data } = await apiClient.post('/livechat/knowledge', payload)
    return data
  },

  // PUT /api/livechat/knowledge/:id — admin
  updateKnowledge: async (id: number, payload: {
    intent?: string
    keywords?: string
    response?: string
    order_index?: number
    is_active?: boolean
  }): Promise<ApiResponse<BotKnowledge>> => {
    const { data } = await apiClient.put(`/livechat/knowledge/${id}`, payload)
    return data
  },

  // DELETE /api/livechat/knowledge/:id — admin
  deleteKnowledge: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/livechat/knowledge/${id}`)
    return data
  },

  // POST /api/livechat/knowledge/test — admin test bot
  testBot: async (message: string): Promise<{ status: string; intent: string; response: string }> => {
    const { data } = await apiClient.post('/livechat/knowledge/test', { message })
    return data
  },
}
