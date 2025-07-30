import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useUpdateSession() {
  const { data: session, update } = useSession()
  
  const updateUserLevel = useCallback(async () => {
    if (!session?.user) return
    
    try {
      // 서버에서 최신 사용자 정보 가져오기
      const response = await fetch(`/api/users/${session.user.id}/experience`)
      if (response.ok) {
        const data = await response.json()
        
        // 세션 업데이트
        await update({
          ...session,
          user: {
            ...session.user,
            level: data.data.currentLevel,
            experience: data.data.totalExperience
          }
        })
      }
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }, [session, update])
  
  return { updateUserLevel }
}