import apiClient from '@/lib/apiClient'
import { ApiResponse, Article, PaginatedResponse } from '@/types'

export interface ArticleListParams {
  status?: 'published' | 'draft'
  search?: string
  page?: number
  limit?: number
}

export const articleService = {
  // GET /api/articles — list without `content` field
  // Public: status=published only. Admin with auth can filter by status
  getAll: async (params?: ArticleListParams): Promise<PaginatedResponse<Article>> => {
    const { data } = await apiClient.get('/articles', { params })
    return data
  },

  // GET /api/articles/:slug — full content included
  getBySlug: async (slug: string): Promise<ApiResponse<Article>> => {
    const { data } = await apiClient.get(`/articles/${slug}`)
    return data
  },

  // POST /api/articles — admin, multipart/form-data with optional cover_image
  create: async (formData: FormData): Promise<ApiResponse<Article>> => {
    const { data } = await apiClient.post('/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // PUT /api/articles/:slug — admin, multipart/form-data
  update: async (slug: string, formData: FormData): Promise<ApiResponse<Article>> => {
    const { data } = await apiClient.put(`/articles/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // PATCH /api/articles/:slug/publish — admin, { status: 'published'|'draft' }
  togglePublish: async (
    slug: string,
    status: 'published' | 'draft'
  ): Promise<ApiResponse<{ slug: string; status: string; published_at: string | null }>> => {
    const { data } = await apiClient.patch(`/articles/${slug}/publish`, { status })
    return data
  },

  // DELETE /api/articles/:slug — admin
  delete: async (slug: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/articles/${slug}`)
    return data
  },
}
