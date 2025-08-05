'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PostViewCounterProps {
  postId: number
}

// In-memory store to prevent duplicate API calls (for React StrictMode)
const pendingViews = new Map<string, boolean>()

export default function PostViewCounter({ postId }: PostViewCounterProps) {
  const { data: session } = useSession()
  
  // 세션 상태가 변경될 때 조회 기록 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const currentUserId = session?.user?.id || 'anonymous'
    const lastUserId = sessionStorage.getItem('last_user_id')
    
    // 사용자가 변경되었을 때 (로그인/로그아웃/사용자 전환)
    if (lastUserId !== currentUserId) {
      // 모든 조회 기록 삭제
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('post_viewed_') || key.startsWith('post_view_count_')) {
          sessionStorage.removeItem(key)
          sessionStorage.removeItem(`${key}_timestamp`)
        }
      })
      
      // 현재 사용자 ID 저장
      sessionStorage.setItem('last_user_id', currentUserId)
    }
  }, [session?.user?.id])

  useEffect(() => {
    // 사용자별로 조회 기록을 분리
    const userId = session?.user?.id || 'anonymous'
    const viewedKey = `post_viewed_${userId}_${postId}`
    const pendingKey = `${userId}_${postId}`
    
    // StrictMode와 SSR을 위한 체크
    if (typeof window === 'undefined') {
      return
    }
    
    // Clean up old session storage entries (older than 24 hours)
    const cleanupOldEntries = () => {
      const now = Date.now()
      const keys = Object.keys(sessionStorage)
      
      keys.forEach(key => {
        if (key.startsWith('post_viewed_') || key.startsWith('post_view_count_')) {
          const timestamp = sessionStorage.getItem(`${key}_timestamp`)
          if (timestamp) {
            const age = now - parseInt(timestamp, 10)
            if (age > 24 * 60 * 60 * 1000) { // 24 hours
              sessionStorage.removeItem(key)
              sessionStorage.removeItem(`${key}_timestamp`)
            }
          }
        }
      })
    }
    
    cleanupOldEntries()
    
    // 이미 조회한 게시글인지 확인
    if (sessionStorage.getItem(viewedKey)) {
      return
    }

    // React StrictMode에서 중복 호출 방지
    if (pendingViews.get(pendingKey)) {
      return
    }

    // API 호출 전에 즉시 플래그 설정 (race condition 방지)
    pendingViews.set(pendingKey, true)
    
    // 딜레이를 주어 StrictMode의 빠른 mount/unmount 사이클을 처리
    const timeoutId = setTimeout(() => {
      // 다시 한번 체크
      if (sessionStorage.getItem(viewedKey)) {
        pendingViews.delete(pendingKey)
        return
      }
      
      sessionStorage.setItem(viewedKey, 'true')
      sessionStorage.setItem(`${viewedKey}_timestamp`, Date.now().toString())

      // 조회수 증가 API 호출
      fetch(`/api/posts/${postId}/view`, {
        method: 'POST'
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.data?.views && typeof window !== 'undefined') {
              // 성공한 경우 실제 조회수 저장 (사용자 구분 없이 저장)
              const viewCountKey = `post_view_count_${postId}`
              sessionStorage.setItem(viewCountKey, data.data.views.toString())
              sessionStorage.setItem(`${viewCountKey}_timestamp`, Date.now().toString())
            }
          } else if (typeof window !== 'undefined') {
            // 실패한 경우 sessionStorage에서 제거
            sessionStorage.removeItem(viewedKey)
            sessionStorage.removeItem(`${viewedKey}_timestamp`)
          }
        })
        .catch((error) => {
          console.error('View count error:', error)
          // 에러 발생 시 sessionStorage에서 제거
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(viewedKey)
            sessionStorage.removeItem(`${viewedKey}_timestamp`)
          }
        })
        .finally(() => {
          // 일정 시간 후 pending 상태 제거 (새로고침 등을 위해)
          setTimeout(() => {
            pendingViews.delete(pendingKey)
          }, 5000)
        })
    }, 100) // 100ms 딜레이로 StrictMode 처리
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      // 빠른 unmount인 경우 pending 상태 제거
      setTimeout(() => {
        if (pendingViews.get(pendingKey) && !sessionStorage.getItem(viewedKey)) {
          pendingViews.delete(pendingKey)
        }
      }, 200)
    }
  }, [postId, session?.user?.id])

  return null
}