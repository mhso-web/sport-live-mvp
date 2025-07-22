'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useSession } from 'next-auth/react'

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

export default function BoardPostsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<BoardCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)

  useEffect(() => {
    fetchCategory()
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchPosts()
    }
  }, [category, page])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/boards/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setCategory(data.data)
      } else {
        router.push('/posts')
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      router.push('/posts')
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/posts?categorySlug=${slug}&page=${page}&limit=20`)
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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
              <Link href="/posts" className="hover:text-gold-500 transition-colors">
                게시판
              </Link>
              <span>/</span>
              <span className="text-gray-100">{category?.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {category && (
                  <div 
                    className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-100">{category?.name}</h1>
                  <p className="text-gray-400 mt-1">{category?.description}</p>
                </div>
              </div>
              
              {session && (
                <Link
                  href={`/posts/write?category=${slug}`}
                  className="btn-premium"
                >
                  글쓰기
                </Link>
              )}
            </div>
          </div>

          {/* 게시글 목록 */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">아직 게시글이 없습니다.</p>
              {session && (
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
                      className="block px-6 py-4 hover:bg-dark-700/50 transition-colors"
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
                              <span>{post.author.username}</span>
                              <span className="text-gold-500">Lv.{post.author.level}</span>
                            </span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                            <span>•</span>
                            <span>조회 {post.stats.views}</span>
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
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!meta.hasPrev}
                    className="px-3 py-1 rounded bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2 + i, meta.totalPages - 4)) + Math.min(i, Math.max(0, 2 - (page - 1)))
                      if (pageNum > meta.totalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded transition-colors ${
                            pageNum === page
                              ? 'bg-gold-600 text-dark-900 font-medium'
                              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }).filter(Boolean)}
                  </div>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!meta.hasNext}
                    className="px-3 py-1 rounded bg-dark-700 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}