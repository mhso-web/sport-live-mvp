/**
 * Application-wide constants configuration
 * All hardcoded values should be defined here for easy management and future configuration
 */

// Authentication & Security
export const AUTH_CONSTANTS = {
  BCRYPT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  SESSION_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  JWT_EXPIRY: '7d',
} as const

// Badge Thresholds
export const BADGE_THRESHOLDS = {
  POST_COUNT: {
    FIRST_TIER: 10,
    SECOND_TIER: 100,
  },
  COMMENT_COUNT: {
    FIRST_TIER: 10,
    SECOND_TIER: 100,
  },
  LIKE_RECEIVED: {
    FIRST_TIER: 10,
    SECOND_TIER: 100,
  },
  LEVEL: {
    FIRST_TIER: 10,
    SECOND_TIER: 15,
  },
  DAILY_LOGIN: {
    ACHIEVEMENT: 30,
  },
  EARLY_ADOPTER: {
    MAX_USERS: 100,
  },
} as const

// Experience Points
export const EXPERIENCE_POINTS = {
  POST_CREATE: 10,
  POST_DELETE: -10,
  COMMENT_CREATE: 5,
  COMMENT_DELETE: -5,
  LIKE_RECEIVED: 3,
  DAILY_LOGIN: 5,
  ACHIEVEMENTS: {
    POST_VIEWS_100: 30,
    POST_VIEWS_1000: 100,
  },
} as const

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  ORDER_BY: 'createdAt',
  ORDER_DIR: 'desc' as const,
} as const

// Validation Rules
export const VALIDATION_RULES = {
  PARTNER: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
  },
  POST: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 1,
    SUMMARY_MAX_LENGTH: 500,
  },
  COMMENT: {
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 1000,
  },
} as const

// API Response Messages
export const API_MESSAGES = {
  AUTH: {
    LOGIN_REQUIRED: '로그인이 필요합니다',
    INVALID_CREDENTIALS: '잘못된 사용자명 또는 비밀번호입니다',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다',
    UNAUTHORIZED: '권한이 없습니다',
  },
  VALIDATION: {
    INVALID_INPUT: '입력값이 올바르지 않습니다',
    MISSING_REQUIRED_FIELDS: '필수 필드가 누락되었습니다',
  },
  SUCCESS: {
    CREATED: '생성되었습니다',
    UPDATED: '수정되었습니다',
    DELETED: '삭제되었습니다',
  },
  ERROR: {
    INTERNAL_SERVER: '서버 오류가 발생했습니다',
    NOT_FOUND: '찾을 수 없습니다',
  },
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_DIR: '/uploads',
} as const

// Cache TTL (in seconds)
export const CACHE_TTL = {
  USER_SESSION: 3600, // 1 hour
  POST_LIST: 300, // 5 minutes
  POST_DETAIL: 600, // 10 minutes
  STATS: 3600, // 1 hour
} as const

// Rate Limiting
export const RATE_LIMITS = {
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
} as const