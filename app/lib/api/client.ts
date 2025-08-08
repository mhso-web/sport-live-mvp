/**
 * API Client for frontend/backend communication
 * This abstraction layer allows easy switching between internal API routes and external API
 */

import { config } from '@/lib/config'

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    total?: number
    totalPages?: number
  }
}

class ApiClient {
  private baseUrl: string
  private useExternalApi: boolean

  constructor() {
    this.useExternalApi = config.USE_EXTERNAL_API === 'true'
    this.baseUrl = this.useExternalApi 
      ? config.API_BASE_URL || '' 
      : ''
  }

  private getUrl(endpoint: string, params?: Record<string, string>): string {
    const url = this.useExternalApi
      ? `${this.baseUrl}${endpoint}`
      : `/api${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams(params)
      return `${url}?${searchParams.toString()}`
    }
    
    return url
  }

  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options
    const url = this.getUrl(endpoint, params)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'API_ERROR',
            message: 'An error occurred',
          },
        }
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
      }
    }
  }

  // GET request
  async get<T = any>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export typed API endpoints
export const api = {
  // Auth
  auth: {
    login: (data: { username: string; password: string }) =>
      apiClient.post('/auth/login', data),
    register: (data: any) =>
      apiClient.post('/auth/register', data),
    logout: () =>
      apiClient.post('/auth/logout'),
  },

  // Posts
  posts: {
    list: (params?: Record<string, string>) =>
      apiClient.get('/posts', params),
    get: (id: number) =>
      apiClient.get(`/posts/${id}`),
    create: (data: any) =>
      apiClient.post('/posts', data),
    update: (id: number, data: any) =>
      apiClient.patch(`/posts/${id}`, data),
    delete: (id: number) =>
      apiClient.delete(`/posts/${id}`),
    view: (id: number) =>
      apiClient.post(`/posts/${id}/view`),
    like: (id: number) =>
      apiClient.post(`/posts/${id}/like`),
    pin: (id: number) =>
      apiClient.post(`/posts/${id}/pin`),
  },

  // Comments
  comments: {
    list: (postId: number) =>
      apiClient.get(`/posts/${postId}/comments`),
    create: (data: any) =>
      apiClient.post('/comments', data),
    update: (id: number, data: any) =>
      apiClient.patch(`/comments/${id}`, data),
    delete: (id: number) =>
      apiClient.delete(`/comments/${id}`),
    like: (id: number) =>
      apiClient.post(`/comments/${id}/like`),
  },

  // Partners
  partners: {
    list: (params?: Record<string, string>) =>
      apiClient.get('/partners', params),
    get: (id: number) =>
      apiClient.get(`/partners/${id}`),
    view: (id: number) =>
      apiClient.post(`/partners/${id}/view`),
    like: (id: number) =>
      apiClient.post(`/partners/${id}/like`),
    rate: (id: number, rating: number) =>
      apiClient.post(`/partners/${id}/rating`, { rating }),
  },

  // Users
  users: {
    profile: (id: number) =>
      apiClient.get(`/users/${id}/profile`),
    updateProfile: (id: number, data: any) =>
      apiClient.patch(`/users/${id}/profile`, data),
    updatePassword: (id: number, data: any) =>
      apiClient.patch(`/users/${id}/password`, data),
    experience: (id: number) =>
      apiClient.get(`/users/${id}/experience`),
  },

  // Admin
  admin: {
    stats: () =>
      apiClient.get('/admin/stats'),
    users: {
      list: (params?: Record<string, string>) =>
        apiClient.get('/admin/users', params),
      get: (id: number) =>
        apiClient.get(`/admin/users/${id}`),
      update: (id: number, data: any) =>
        apiClient.patch(`/admin/users/${id}`, data),
      updateRole: (id: number, role: string) =>
        apiClient.patch(`/admin/users/${id}/role`, { role }),
      toggleStatus: (id: number) =>
        apiClient.patch(`/admin/users/${id}/status`),
    },
    posts: {
      list: (params?: Record<string, string>) =>
        apiClient.get('/admin/posts', params),
      toggleVisibility: (id: number) =>
        apiClient.patch(`/admin/posts/${id}/visibility`),
      delete: (id: number) =>
        apiClient.delete(`/admin/posts/${id}`),
    },
    partners: {
      list: (params?: Record<string, string>) =>
        apiClient.get('/admin/partners', params),
      create: (data: any) =>
        apiClient.post('/admin/partners', data),
      update: (id: number, data: any) =>
        apiClient.patch(`/admin/partners/${id}`, data),
      toggleStatus: (id: number) =>
        apiClient.patch(`/admin/partners/${id}/toggle-status`),
      delete: (id: number) =>
        apiClient.delete(`/admin/partners/${id}`),
    },
  },
}