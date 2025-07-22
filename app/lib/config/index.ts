import { z } from 'zod'

const ConfigSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32).optional(),
  
  // Redis
  REDIS_URL: z.string(),
  
  // Socket.io
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  
  // External API (for future separation)
  USE_EXTERNAL_API: z.string().transform(val => val === 'true').default('false'),
  API_BASE_URL: z.string().url().optional(),
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
})