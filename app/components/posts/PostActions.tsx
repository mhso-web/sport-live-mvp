'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PostActionsProps {
  postId: number
  authorId: number
}

export default function PostActions({ postId, authorId }: PostActionsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAuthor = session?.user?.id === authorId
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUB_ADMIN'
  const canEdit = isAuthor || isAdmin

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/posts')
        router.refresh()
      } else {
        alert('게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  if (!canEdit) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-gray-400 hover:text-gray-300 hover:bg-dark-700 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20">
            <Link
              href={`/posts/edit/${postId}`}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-gold-500 transition-colors"
            >
              수정하기
            </Link>
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors"
            >
              삭제하기
            </button>
          </div>
        </>
      )}
    </div>
  )
}