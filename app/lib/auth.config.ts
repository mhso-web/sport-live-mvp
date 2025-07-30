import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authService } from '@/lib/container'
import { config } from '@/lib/config'
import { ExperienceService } from '@/lib/services/experienceService'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const { user } = await authService.login({
            username: credentials.username,
            password: credentials.password
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            role: user.role,
            level: user.level,
            experience: user.experience
          } as any
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        const userId = parseInt(user.id)
        
        // 마지막 로그인 시간 업데이트
        await prisma.user.update({
          where: { id: userId },
          data: { lastLoginAt: new Date() }
        })
        
        // 일일 로그인 보상 체크 및 부여
        await ExperienceService.checkDailyLogin(userId)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.level = user.level
        token.experience = user.experience
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.level = token.level as number
        session.user.experience = token.experience as number
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  secret: config.NEXTAUTH_SECRET
}