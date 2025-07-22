'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'

interface BoardCategory {
  id: number
  slug: string
  name: string
  boardType: string
}

export default function PostWritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?from=/posts/write')
    }
  }, [status, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/boards?type=COMMUNITY')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
        
        // URL 파라미터에서 카테고리 슬러그 확인
        const categorySlug = searchParams.get('category')
        if (categorySlug) {
          const category = data.data.find((c: BoardCategory) => c.slug === categorySlug)
          if (category) {
            setCategoryId(category.id)
            return
          }
        }
        
        // 첫 번째 카테고리를 기본값으로 설정
        if (data.data.length > 0) {
          setCategoryId(data.data[0].id)
        }
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
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          boardType: selectedCategory?.boardType || 'COMMUNITY',
          categoryId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 작성한 게시글로 이동
        router.push(`/posts/${selectedCategory?.slug}/${data.data.id}`)
        router.refresh()
      } else {
        setErrors({ submit: data.error || '게시글 작성에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      setErrors({ submit: '게시글 작성 중 오류가 발생했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </main>
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-100">게시글 작성</h1>
            <p className="mt-2 text-gray-400">커뮤니티에 새로운 글을 작성해보세요.</p>
          </div>

          {/* 작성 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 게시판 선택 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                게시판 선택 <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-gray-300 hover:border-gold-600/50 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span className={categoryId ? '' : 'text-gray-500'}>
                    {categoryId ? categories.find(c => c.id === categoryId)?.name : '게시판을 선택하세요'}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div className="absolute mt-2 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 overflow-hidden">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(category.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-dark-700 hover:text-gold-500 transition-colors flex items-center justify-between ${
                          categoryId === category.id ? 'bg-dark-700/50 text-gold-500' : 'text-gray-300'
                        }`}
                      >
                        <span>{category.name}</span>
                        {categoryId === category.id && (
                          <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                href="/posts"
                className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '작성 중...' : '게시글 작성'}
              </button>
            </div>
          </form>

          {/* 작성 가이드 */}
          <div className="mt-12 p-6 bg-dark-800 rounded-lg border border-dark-700">
            <h3 className="text-lg font-medium text-gray-100 mb-4">게시글 작성 가이드</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <span className="text-gold-500 mr-2">•</span>
                <span>타인을 비방하거나 명예를 훼손하는 내용은 작성하지 마세요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold-500 mr-2">•</span>
                <span>욕설, 비속어, 혐오 표현을 사용하지 마세요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold-500 mr-2">•</span>
                <span>광고, 홍보성 글은 별도의 게시판을 이용해주세요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold-500 mr-2">•</span>
                <span>개인정보(전화번호, 주소 등)를 포함하지 마세요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold-500 mr-2">•</span>
                <span>커뮤니티 가이드라인을 위반하는 게시글은 삭제될 수 있습니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}