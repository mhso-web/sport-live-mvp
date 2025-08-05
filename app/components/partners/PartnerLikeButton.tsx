'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PartnerLikeButtonProps {
  partnerId: number
  initialLikeCount: number
}

export default function PartnerLikeButton({ 
  partnerId, 
  initialLikeCount 
}: PartnerLikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // 좋아요 상태 확인
  useEffect(() => {
    if (session?.user) {
      checkLikeStatus()
    }
  }, [session])

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/partners/${partnerId}/like`)
      const data = await response.json()
      
      if (data.success) {
        setLiked(data.data.liked)
      }
    } catch (error) {
      console.error('Failed to check like status:', error)
    }
  }

  const handleToggleLike = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/partners/${partnerId}/like`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.data.liked)
        setLikeCount(data.data.likeCount)
        router.refresh()
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
        liked
          ? 'bg-gold-600 hover:bg-gold-500 text-white'
          : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="mr-2">{liked ? '👍' : '👍'}</span>
      좋아요 {likeCount > 0 && `(${likeCount})`}
    </button>
  )
}