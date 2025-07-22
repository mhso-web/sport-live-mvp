import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UnauthorizedException } from '@/lib/errors'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    throw new UnauthorizedException()
  }
  
  return session
}

export async function optionalAuth() {
  return await getSession()
}