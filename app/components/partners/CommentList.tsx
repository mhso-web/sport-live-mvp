'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Comment {
  id: number
  content: string
  createdAt: string
  userId: number
  user: {
    id: number
    username: string
    level: number
  }
}

interface CommentListProps {
  partnerId: number
  initialComments: Comment[]
  totalComments: number
}

export default function CommentList({ 
  partnerId, 
  initialComments,
  totalComments 
}: CommentListProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialComments.length < totalComments)

  const loadMoreComments = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/partners/${partnerId}/comments?page=${page + 1}`)
      const data = await response.json()

      if (data.success) {
        setComments([...comments, ...data.data.data])
        setPage(page + 1)
        setHasMore(data.data.meta.hasNext)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/partners/${partnerId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId))
        router.refresh()
      } else {
        alert(data.error || '댓글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 100) return 'text-purple-400' // 마스터
    if (level >= 80) return 'text-red-400' // 다이아
    if (level >= 60) return 'text-gold-400' // 골드
    if (level >= 40) return 'text-gray-300' // 실버
    return 'text-amber-700' // 브론즈
  }

  if (comments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-dark-700 pb-4 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-medium hover:text-gold-500 transition-colors"
                >
                  <span className={getLevelColor(comment.user.level)}>
                    Lv.{comment.user.level}
                  </span>
                  <span className="ml-1 text-gray-300">
                    {comment.user.username}
                  </span>
                </Link>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {/* 삭제 버튼 */}
              {session?.user && (
                parseInt(session.user.id) === comment.userId || 
                session.user.role === 'ADMIN' || 
                session.user.role === 'SUB_ADMIN'
              ) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
            <p className="text-gray-400">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMoreComments}
            disabled={isLoading}
            className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩중...' : '댓글 더 보기'}
          </button>
        </div>
      )}
    </div>
  )
}