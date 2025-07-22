import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      level: number
      experience: number
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    level: number
    experience: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    level: number
    experience: number
  }
}