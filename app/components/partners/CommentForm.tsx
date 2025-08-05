'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  partnerId: number
  onSuccess: () => void
}

export default function CommentForm({ partnerId, onSuccess }: CommentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (content.trim().length < 10) {
      setError('댓글은 10자 이상 작성해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/partners/${partnerId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setContent('')
        onSuccess()
        router.refresh()
      } else {
        setError(data.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
      setError('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={session?.user ? "댓글을 작성해주세요 (10자 이상)" : "로그인 후 댓글을 작성할 수 있습니다."}
          className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none"
          rows={3}
          maxLength={500}
          disabled={!session?.user || isLoading}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            {content.length}/500
          </p>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!session?.user || isLoading || content.trim().length < 10}
        >
          {isLoading ? '작성중...' : '댓글 작성'}
        </button>
      </div>
    </form>
  )
}