/**
 * Custom React hooks for API interactions
 * These hooks provide a clean interface for components to interact with the API
 */

import { useState, useCallback } from 'react'
import { api } from '@/lib/api/client'
import type { ApiResponse } from '@/types/api.types'

// Generic API hook for handling loading, error, and data states
export function useApi<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (response.success && response.data) {
        setData(response.data)
      } else if (!response.success && response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: errorMessage
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Hook for post-related API calls
export function usePostApi() {
  const { data, loading, error, execute, reset } = useApi()

  const getPosts = useCallback(async (params?: Record<string, string>) => {
    return execute(() => api.posts.list(params))
  }, [execute])

  const getPost = useCallback(async (id: number) => {
    return execute(() => api.posts.get(id))
  }, [execute])

  const createPost = useCallback(async (data: any) => {
    return execute(() => api.posts.create(data))
  }, [execute])

  const updatePost = useCallback(async (id: number, data: any) => {
    return execute(() => api.posts.update(id, data))
  }, [execute])

  const deletePost = useCallback(async (id: number) => {
    return execute(() => api.posts.delete(id))
  }, [execute])

  const likePost = useCallback(async (id: number) => {
    return execute(() => api.posts.like(id))
  }, [execute])

  const viewPost = useCallback(async (id: number) => {
    return execute(() => api.posts.view(id))
  }, [execute])

  return {
    data,
    loading,
    error,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    viewPost,
    reset
  }
}

// Hook for comment-related API calls
export function useCommentApi() {
  const { data, loading, error, execute, reset } = useApi()

  const getComments = useCallback(async (postId: number) => {
    return execute(() => api.comments.list(postId))
  }, [execute])

  const createComment = useCallback(async (data: any) => {
    return execute(() => api.comments.create(data))
  }, [execute])

  const updateComment = useCallback(async (id: number, data: any) => {
    return execute(() => api.comments.update(id, data))
  }, [execute])

  const deleteComment = useCallback(async (id: number) => {
    return execute(() => api.comments.delete(id))
  }, [execute])

  const likeComment = useCallback(async (id: number) => {
    return execute(() => api.comments.like(id))
  }, [execute])

  return {
    data,
    loading,
    error,
    getComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    reset
  }
}

// Hook for auth-related API calls
export function useAuthApi() {
  const { data, loading, error, execute, reset } = useApi()

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    return execute(() => api.auth.login(credentials))
  }, [execute])

  const register = useCallback(async (userData: any) => {
    return execute(() => api.auth.register(userData))
  }, [execute])

  const logout = useCallback(async () => {
    return execute(() => api.auth.logout())
  }, [execute])

  return {
    data,
    loading,
    error,
    login,
    register,
    logout,
    reset
  }
}

// Hook for partner-related API calls
export function usePartnerApi() {
  const { data, loading, error, execute, reset } = useApi()

  const getPartners = useCallback(async (params?: Record<string, string>) => {
    return execute(() => api.partners.list(params))
  }, [execute])

  const getPartner = useCallback(async (id: number) => {
    return execute(() => api.partners.get(id))
  }, [execute])

  const viewPartner = useCallback(async (id: number) => {
    return execute(() => api.partners.view(id))
  }, [execute])

  const likePartner = useCallback(async (id: number) => {
    return execute(() => api.partners.like(id))
  }, [execute])

  const ratePartner = useCallback(async (id: number, rating: number) => {
    return execute(() => api.partners.rate(id, rating))
  }, [execute])

  return {
    data,
    loading,
    error,
    getPartners,
    getPartner,
    viewPartner,
    likePartner,
    ratePartner,
    reset
  }
}