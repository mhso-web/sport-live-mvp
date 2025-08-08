import { z } from 'zod'

const ConfigSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32).optional(),
  
  // Redis (optional for initial deployment)
  REDIS_URL: z.string().optional(),
  
  // Socket.io (optional for initial deployment)
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  
  // External API (for future separation)
  USE_EXTERNAL_API: z.string().transform(val => val === 'true').default('false').optional(),
  API_BASE_URL: z.string().url().optional(),
  
  // File Upload
  UPLOAD_MAX_SIZE: z.string().transform(val => parseInt(val, 10)).default('5242880').optional(),
  UPLOAD_ALLOWED_TYPES: z.string().transform(val => val.split(',')).default('image/jpeg,image/png,image/gif,image/webp').optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000').optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100').optional(),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('5').optional(),
  
  // Cache TTL
  CACHE_TTL_USER_SESSION: z.string().transform(val => parseInt(val, 10)).default('3600').optional(),
  CACHE_TTL_POST_LIST: z.string().transform(val => parseInt(val, 10)).default('300').optional(),
  CACHE_TTL_POST_DETAIL: z.string().transform(val => parseInt(val, 10)).default('600').optional(),
  CACHE_TTL_STATS: z.string().transform(val => parseInt(val, 10)).default('3600').optional(),
  
  // Feature Flags
  ENABLE_SOCKET_IO: z.string().transform(val => val === 'true').default('false').optional(),
  ENABLE_REDIS_CACHE: z.string().transform(val => val === 'true').default('false').optional(),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true').optional(),
})

export type Config = z.infer<typeof ConfigSchema>

// Parse and validate environment variables
export const config = ConfigSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  JWT_SECRET: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  USE_EXTERNAL_API: process.env.USE_EXTERNAL_API,
  API_BASE_URL: process.env.API_BASE_URL,
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
  UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_AUTH_MAX_REQUESTS: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS,
  CACHE_TTL_USER_SESSION: process.env.CACHE_TTL_USER_SESSION,
  CACHE_TTL_POST_LIST: process.env.CACHE_TTL_POST_LIST,
  CACHE_TTL_POST_DETAIL: process.env.CACHE_TTL_POST_DETAIL,
  CACHE_TTL_STATS: process.env.CACHE_TTL_STATS,
  ENABLE_SOCKET_IO: process.env.ENABLE_SOCKET_IO,
  ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE,
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
})