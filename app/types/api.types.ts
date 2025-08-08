/**
 * API Type Definitions
 * Central location for all API-related types
 */

// Base API Response Type
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
    limit?: number
  }
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    total: number
    totalPages: number
    limit: number
  }
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode?: number
}

// Filter Types
export interface PostFilters {
  boardType?: string
  categorySlug?: string
  userId?: number
  search?: string
  isPinned?: boolean
  isDeleted?: boolean
}

export interface UserFilters {
  role?: string
  isActive?: boolean
  search?: string
  level?: number
}

export interface PartnerFilters {
  isActive?: boolean
  search?: string
  categoryId?: number
}

// Request Types
export interface CreatePostRequest {
  boardType: string
  categoryId: number
  title: string
  content: string
  summary?: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  summary?: string
  categoryId?: number
}

export interface CreateCommentRequest {
  postId: number
  content: string
  parentId?: number
}

export interface UpdateCommentRequest {
  content: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface UpdateProfileRequest {
  email?: string
  currentPassword?: string
  newPassword?: string
}

export interface CreatePartnerRequest {
  name: string
  description: string
  contactInfo?: string
  bannerImageUrl?: string
}

export interface UpdatePartnerRequest {
  name?: string
  description?: string
  contactInfo?: string
  bannerImageUrl?: string
  isActive?: boolean
}

// Response Types
export interface UserResponse {
  id: number
  username: string
  email?: string
  role: string
  level: number
  experience: number
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface PostResponse {
  id: number
  boardType: string
  category: {
    id: number
    name: string
    slug: string
  }
  user: {
    id: number
    username: string
    level: number
  }
  title: string
  content: string
  summary?: string
  views: number
  likesCount: number
  commentsCount: number
  isPinned: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CommentResponse {
  id: number
  postId: number
  user: {
    id: number
    username: string
    level: number
  }
  content: string
  likesCount: number
  isDeleted: boolean
  parentId?: number
  replies?: CommentResponse[]
  createdAt: string
  updatedAt: string
}

export interface PartnerResponse {
  id: number
  name: string
  description: string
  contactInfo?: string
  bannerImageUrl?: string
  viewCount: number
  likeCount: number
  rating: number
  ratingCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StatsResponse {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalPartners: number
  dailyStats: {
    date: string
    users: number
    posts: number
    comments: number
    views: number
  }[]
}

export interface BadgeResponse {
  badgeType: string
  earnedAt: string
  metadata?: any
}

export interface ExperienceLogResponse {
  actionType: string
  experienceGained: number
  createdAt: string
}

// Auth Types
export interface AuthUser {
  id: string
  username: string
  email?: string
  role: string
  level: number
  experience: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

// Socket Event Types
export interface SocketEvent<T = any> {
  event: string
  data: T
  timestamp: number
}

// File Upload Types
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}