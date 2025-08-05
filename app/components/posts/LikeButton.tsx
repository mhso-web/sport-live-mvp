'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useUpdateSession } from '@/hooks/useUpdateSession'

interface LikeButtonProps {
  postId: number
  initialLikesCount: number
  size?: 'sm' | 'md' | 'lg'
}

export default function LikeButton({ postId, initialLikesCount, size = 'md' }: LikeButtonProps) {
  const { data: session } = useSession()
  const { updateUserLevel } = useUpdateSession()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      // Check if user already liked this post
      fetch(`/api/posts/${postId}/like`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLiked(data.data.liked)
          }
        })
        .catch(console.error)
    }
  }, [session, postId])

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.data.liked)
        setLikesCount(data.data.likesCount)
        
        // 세션 업데이트
        if (data.userLevel || data.userExperience) {
          await updateUserLevel()
        }
      } else {
        // 에러 처리
        if (data.error?.message) {
          // 자신의 게시글 좋아요 시도 등의 에러 메시지 표시
          alert(data.error.message)
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const buttonClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center rounded-lg border transition-all ${buttonClasses[size]} ${
        liked
          ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'border-dark-700 bg-dark-800 text-gray-400 hover:border-dark-600 hover:text-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {liked ? (
        <HeartSolidIcon className={sizeClasses[size]} />
      ) : (
        <HeartIcon className={sizeClasses[size]} />
      )}
      <span className="font-medium">{likesCount}</span>
    </button>
  )
}