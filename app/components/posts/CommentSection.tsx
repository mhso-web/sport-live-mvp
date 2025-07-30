'use client'

import { useState, memo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import CommentLikeButton from './CommentLikeButton'

interface Comment {
  id: number
  content: string
  createdAt: Date
  likesCount: number
  user: {
    id: number
    username: string
    profileImage: string | null
    level: number
  }
  replies: Comment[]
}

interface CommentSectionProps {
  postId: number
  comments: Comment[]
  commentCount: number
}

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
  replyTo: number | null
  replyContent: string
  isSubmitting: boolean
  onReplyClick: (commentId: number) => void
  onReplyChange: (content: string) => void
  onReplySubmit: (commentId: number) => void
  onReplyCancel: () => void
}

const CommentItem = memo(({ 
  comment, 
  isReply = false, 
  replyTo, 
  replyContent, 
  isSubmitting,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
  onReplyCancel
}: CommentItemProps) => (
  <div className={`${isReply ? 'ml-12' : ''}`}>
    <div className="flex space-x-3">
      <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-lg">👤</span>
      </div>
      <div className="flex-1">
        <div className="bg-dark-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-100">{comment.user.username}</span>
              <span className="text-xs bg-gold-900/30 text-gold-400 px-2 py-0.5 rounded">
                Lv.{comment.user.level}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
              </span>
            </div>
          </div>
          <p className="text-gray-300 mb-2">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <CommentLikeButton 
              commentId={comment.id} 
              initialLikesCount={comment.likesCount} 
            />
            {!isReply && (
              <button
                onClick={() => onReplyClick(comment.id)}
                className="text-xs text-gray-400 hover:text-gold-500 transition-colors"
              >
                답글 달기
              </button>
            )}
          </div>
        </div>

        {/* 답글 작성 폼 */}
        {replyTo === comment.id && (
          <div className="mt-3 ml-12">
            <form onSubmit={(e) => {
              e.preventDefault()
              onReplySubmit(comment.id)
            }}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => onReplyChange(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  disabled={isSubmitting}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  답글
                </button>
                <button
                  type="button"
                  onClick={onReplyCancel}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 답글 목록 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isReply 
                replyTo={replyTo}
                replyContent={replyContent}
                isSubmitting={isSubmitting}
                onReplyClick={onReplyClick}
                onReplyChange={onReplyChange}
                onReplySubmit={onReplySubmit}
                onReplyCancel={onReplyCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
))

CommentItem.displayName = 'CommentItem'

export default function CommentSection({ postId, comments: initialComments, commentCount }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.data, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplyClick = useCallback((commentId: number) => {
    setReplyTo(commentId)
    setReplyContent('')
  }, [])

  const handleReplyChange = useCallback((content: string) => {
    setReplyContent(content)
  }, [])

  const handleReplyCancel = useCallback(() => {
    setReplyTo(null)
    setReplyContent('')
  }, [])

  const handleSubmitReply = useCallback(async (parentId: number) => {
    if (!session || !replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // 답글을 해당 댓글에 추가
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.data]
            }
          }
          return comment
        }))
        setReplyTo(null)
        setReplyContent('')
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [session, replyContent, isSubmitting, postId, comments])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-100 mb-6">
        댓글 <span className="text-gold-500">{commentCount}</span>
      </h2>

      {/* 댓글 작성 폼 */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={3}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none"
              disabled={isSubmitting}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '등록 중...' : '댓글 등록'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 bg-dark-800 rounded-lg border border-dark-700 p-6 text-center">
          <p className="text-gray-400 mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors"
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              replyTo={replyTo}
              replyContent={replyContent}
              isSubmitting={isSubmitting}
              onReplyClick={handleReplyClick}
              onReplyChange={handleReplyChange}
              onReplySubmit={handleSubmitReply}
              onReplyCancel={handleReplyCancel}
            />
          ))
        )}
      </div>
    </div>
  )
}