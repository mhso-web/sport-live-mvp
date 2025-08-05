'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import PostSearch from '@/components/posts/PostSearch'
import Pagination from '@/components/ui/Pagination'
import ViewCountDisplay from '@/components/posts/ViewCountDisplay'
import { getLevelColorClass, getPostBorderClass } from '@/lib/utils/levelUtils'

interface Post {
  id: number
  title: string
  summary: string
  boardType: string
  category: {
    name: string
    slug: string
  } | null
  author: {
    username: string
    level: number
  }
  stats: {
    views: number
    likes: number
    comments: number
  }
  isPinned: boolean
  createdAt: string
}

interface BoardCategory {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PostListContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const slug = params.slug as string
  const searchQuery = searchParams.get('q') || ''

  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<BoardCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    fetchCategory()
  }, [slug])

  useEffect(() => {
    // Reset page when search query changes
    const pageParam = searchParams.get('page')
    setPage(pageParam ? parseInt(pageParam) : 1)
  }, [searchParams])

  useEffect(() => {
    if (category) {
      fetchPosts()
    }
  }, [category, page, searchQuery, itemsPerPage])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (category) {
        fetchPosts()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && category) {
        fetchPosts()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [category, page, searchQuery, itemsPerPage])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/boards/${slug}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        console.error(`Failed to fetch category: ${response.status}`)
        // API 실패 시 기본 카테고리 데이터 사용
        const defaultCategories: Record<string, BoardCategory> = {
          general: { id: 1, name: '자유게시판', description: '자유롭게 대화를 나누는 공간', icon: '💬', color: '#60A5FA' },
          soccer: { id: 2, name: '축구', description: '축구 관련 정보와 토론', icon: '⚽', color: '#34D399' },
          baseball: { id: 3, name: '야구', description: '야구 관련 정보와 토론', icon: '⚾', color: '#F87171' },
          basketball: { id: 4, name: '농구', description: '농구 관련 정보와 토론', icon: '🏀', color: '#FB923C' }
        }
        
        if (defaultCategories[slug]) {
          setCategory(defaultCategories[slug])
        } else {
          router.push('/posts')
        }
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCategory(data.data)
      } else {
        router.push('/posts')
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      // API 호출 실패 시에도 기본 카테고리로 시도
      const defaultCategories: Record<string, BoardCategory> = {
        general: { id: 1, name: '자유게시판', description: '자유롭게 대화를 나누는 공간', icon: '💬', color: '#60A5FA' },
        soccer: { id: 2, name: '축구', description: '축구 관련 정보와 토론', icon: '⚽', color: '#34D399' },
        baseball: { id: 3, name: '야구', description: '야구 관련 정보와 토론', icon: '⚾', color: '#F87171' },
        basketball: { id: 4, name: '농구', description: '농구 관련 정보와 토론', icon: '🏀', color: '#FB923C' }
      }
      
      if (defaultCategories[slug]) {
        setCategory(defaultCategories[slug])
      } else {
        router.push('/posts')
      }
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        categorySlug: slug,
        page: page.toString(),
        limit: itemsPerPage.toString()
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/posts?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data)
        setMeta(data.meta)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/posts/${slug}?${params.toString()}`)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    // 페이지를 1로 리셋
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')
    router.push(`/posts/${slug}?${params.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
          <Link href="/posts" className="hover:text-gold-500 transition-colors">
            게시판
          </Link>
          <span>/</span>
          <span className="text-gray-300">{category?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 flex items-center space-x-3">
              {category?.icon && <span className="text-4xl">{category.icon}</span>}
              <span>{category?.name}</span>
            </h1>
            {category?.description && (
              <p className="text-gray-400 mt-2">{category.description}</p>
            )}
          </div>
          {session && (
            <Link
              href={`/posts/write?category=${slug}`}
              className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors"
            >
              글쓰기
            </Link>
          )}
        </div>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <PostSearch categorySlug={slug} />
      </div>

      {/* 검색 결과 표시 */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-400">
          <span className="text-gold-500">"{searchQuery}"</span> 검색 결과: {meta?.total || 0}개
        </div>
      )}

      {/* 게시글 목록 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">
            {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
          </p>
          {session && !searchQuery && (
            <Link
              href={`/posts/write?category=${slug}`}
              className="inline-block mt-4 text-gold-500 hover:text-gold-400 transition-colors"
            >
              첫 번째 게시글을 작성해보세요!
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <div className="divide-y divide-dark-700">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${slug}/${post.id}`}
                  className={`block px-6 py-4 hover:bg-dark-700/50 transition-colors ${getPostBorderClass(post.author.level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {post.isPinned && (
                          <span className="text-xs bg-gold-900/30 text-gold-400 px-2 py-1 rounded">
                            📌 고정
                          </span>
                        )}
                        <h3 className="text-lg font-medium text-gray-100 hover:text-gold-500 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      
                      {post.summary && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {post.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <span className={`font-medium ${getLevelColorClass(post.author.level)}`}>{post.author.username}</span>
                          <span className="text-gold-500">Lv.{post.author.level}</span>
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                        <span>•</span>
                        <ViewCountDisplay postId={post.id} initialViews={post.stats.views} />
                        {post.stats.comments > 0 && (
                          <>
                            <span>•</span>
                            <span>댓글 {post.stats.comments}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4 text-sm">
                      {post.stats.likes > 0 && (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <span>👍</span>
                          <span>{post.stats.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 페이지네이션 */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
            />
          )}
        </>
      )}
    </div>
  )
}