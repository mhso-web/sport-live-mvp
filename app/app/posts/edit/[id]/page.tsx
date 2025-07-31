'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface BoardCategory {
  id: number
  slug: string
  name: string
  boardType: string
}

interface PostData {
  id: number
  title: string
  content: string
  categoryId: number
  category: BoardCategory
  user: {
    id: number
    username: string
  }
}

export default function PostEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalPost, setOriginalPost] = useState<PostData | null>(null)

  const postId = parseInt(params.id)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?from=/posts/edit/' + params.id)
    }
  }, [status, router, params.id])

  useEffect(() => {
    if (session) {
      fetchPostData()
      fetchCategories()
    }
  }, [session])

  const fetchPostData = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const post = data.data
        setOriginalPost(post)
        setTitle(post.title)
        setContent(post.content)
        setCategoryId(post.categoryId)
        
        // 권한 체크
        const isAuthor = session?.user?.id === post.user.id.toString()
        const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUB_ADMIN'
        
        if (!isAuthor && !isAdmin) {
          router.push('/posts')
          return
        }
      } else {
        router.push('/posts')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/posts')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/boards?type=COMMUNITY')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.'
    } else if (title.length > 200) {
      newErrors.title = '제목은 200자 이내로 입력해주세요.'
    }

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.'
    } else if (content.length < 10) {
      newErrors.content = '내용은 10자 이상 입력해주세요.'
    }

    if (!categoryId) {
      newErrors.category = '게시판을 선택해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const selectedCategory = categories.find(c => c.id === categoryId)
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 수정한 게시글로 이동
        router.push(`/posts/${selectedCategory?.slug}/${postId}`)
        router.refresh()
      } else {
        setErrors({ submit: data.error || '게시글 수정에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Failed to update post:', error)
      setErrors({ submit: '게시글 수정 중 오류가 발생했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <main className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </main>
    )
  }

  if (!session || !originalPost) {
    return null
  }

  return (
    <main className="min-h-screen bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-100">게시글 수정</h1>
            <p className="mt-2 text-gray-400">게시글 내용을 수정할 수 있습니다.</p>
          </div>

          {/* 수정 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 게시판 선택 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                게시판 선택 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={categoryId || ''}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                <option value="">게시판을 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                maxLength={200}
              />
              <div className="mt-1 flex justify-between">
                <p className="text-sm text-red-500">{errors.title}</p>
                <p className="text-sm text-gray-500">{title.length}/200</p>
              </div>
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요 (최소 10자 이상)"
                rows={15}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none leading-relaxed"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            {/* 제출 오류 */}
            {errors.submit && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-between items-center pt-4">
              <Link
                href={`/posts/${originalPost.category.slug}/${postId}`}
                className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '수정 중...' : '게시글 수정'}
              </button>
            </div>
          </form>

          {/* 수정 정보 */}
          <div className="mt-8 p-4 bg-dark-800 rounded-lg border border-dark-700">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">작성자:</span>{' '}
                <span className="text-gray-300">{originalPost.user.username}</span>
              </div>
              <div className="text-gray-600">•</div>
              <div>
                <span className="text-gray-500">원본 게시판:</span>{' '}
                <span className="text-gray-300">{originalPost.category.name}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}