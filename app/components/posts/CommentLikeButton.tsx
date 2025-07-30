'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface CommentLikeButtonProps {
  commentId: number
  initialLikesCount: number
}

export default function CommentLikeButton({ commentId, initialLikesCount }: CommentLikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      // Check if user already liked this comment
      fetch(`/api/comments/${commentId}/like`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLiked(data.data.liked)
          }
        })
        .catch(console.error)
    }
  }, [session, commentId])

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.data.liked)
        setLikesCount(data.data.likesCount)
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 text-xs transition-all ${
        liked
          ? 'text-red-500 hover:text-red-400'
          : 'text-gray-500 hover:text-gray-400'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {liked ? (
        <HeartSolidIcon className="h-4 w-4" />
      ) : (
        <HeartIcon className="h-4 w-4" />
      )}
      {likesCount > 0 && <span>{likesCount}</span>}
    </button>
  )
}