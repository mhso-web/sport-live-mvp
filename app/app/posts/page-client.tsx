'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Post {
  id: number
  title: string
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
    comments: number
  }
  createdAt: string
}

interface BoardCategory {
  id: number
  slug: string
  name: string
  icon: string
  color: string
}

interface BoardSection {
  category: BoardCategory
  posts: Post[]
}

export default function PostsPage() {
  const [boardSections, setBoardSections] = useState<BoardSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoardsWithPosts()
  }, [])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchBoardsWithPosts()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBoardsWithPosts()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchBoardsWithPosts = async () => {
    try {
      setLoading(true)
      // 먼저 모든 게시판 카테고리 가져오기
      const boardsResponse = await fetch('/api/boards')
      
      if (!boardsResponse.ok) {
        throw new Error(`Failed to fetch boards: ${boardsResponse.status}`)
      }
      
      const boardsData = await boardsResponse.json()
      
      console.log('Boards data:', boardsData) // 디버깅용
      
      if (boardsData.success && boardsData.data) {
        const sections: BoardSection[] = []
        
        // 각 게시판별로 최근 게시글 10개씩 가져오기
        const promises = boardsData.data.map(async (category: BoardCategory) => {
          try {
            const postsResponse = await fetch(`/api/posts?categorySlug=${category.slug}&limit=10`)
            
            if (!postsResponse.ok) {
              console.error(`Failed to fetch posts for ${category.slug}: ${postsResponse.status}`)
              return
            }
            
            const postsData = await postsResponse.json()
            
            console.log(`Posts for ${category.slug}:`, postsData) // 디버깅용
            
            if (postsData.success && postsData.data && postsData.data.length > 0) {
              sections.push({
                category,
                posts: postsData.data
              })
            }
          } catch (err) {
            console.error(`Error fetching posts for ${category.slug}:`, err)
          }
        })
        
        await Promise.all(promises)
        
        // 섹션을 orderIndex나 id 순으로 정렬
        sections.sort((a, b) => a.category.id - b.category.id)
        console.log('Final sections:', sections) // 디버깅용
        setBoardSections(sections)
      } else {
        console.error('No boards data received')
      }
    } catch (error) {
      console.error('Failed to fetch boards and posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">게시판</h1>
            <p className="mt-2 text-gray-400">모든 게시판의 최근 글을 한눈에 확인하세요</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : boardSections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">아직 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {boardSections.map((section) => (
                <div key={section.category.id} className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
                  {/* 섹션 헤더 */}
                  <div className="px-6 py-4 bg-dark-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${section.category.color}20` }}
                      >
                        {section.category.icon}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-100">{section.category.name}</h2>
                    </div>
                    <Link
                      href={`/posts/${section.category.slug}`}
                      className="text-sm text-gold-500 hover:text-gold-400 transition-colors"
                    >
                      더보기 →
                    </Link>
                  </div>

                  {/* 게시글 목록 */}
                  <div className="divide-y divide-dark-700">
                    {section.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${section.category.slug}/${post.id}`}
                        className="block px-6 py-3 hover:bg-dark-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-100 hover:text-gold-500 transition-colors truncate">
                              {post.title}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>{post.author.username}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                              <span>•</span>
                              <span>조회 {post.stats.views}</span>
                              {post.stats.comments > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-gold-500">댓글 {post.stats.comments}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}