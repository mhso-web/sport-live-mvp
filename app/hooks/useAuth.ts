'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface UseAuthOptions {
  redirectTo?: string
  redirectIfFound?: boolean
}

export function useAuth(options?: UseAuthOptions) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { redirectTo = '/login', redirectIfFound = false } = options || {}

  useEffect(() => {
    if (status === 'loading') return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !session) ||
      // If redirectIfFound is set, redirect if the user was found
      (redirectIfFound && session)
    ) {
      router.push(redirectTo)
    }
  }, [session, status, redirectIfFound, redirectTo, router])

  return { session, status, isAuthenticated: !!session }
}

export function useRequireAuth(redirectTo = '/login') {
  const { session, status } = useAuth({ redirectTo })
  return { session, status, isLoading: status === 'loading' }
}