import Navigation from '@/components/layout/Navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { PostRepository } from '@/lib/repositories/postRepository'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '게시판 - Sports Live',
  description: '스포츠 라이브의 모든 게시판을 한눈에 확인하세요. 축구, 야구, 농구, e스포츠 등 다양한 스포츠 커뮤니티',
  keywords: '스포츠 게시판, 스포츠 커뮤니티, 축구 게시판, 야구 게시판, 농구 게시판, e스포츠 게시판',
  openGraph: {
    title: '게시판 - Sports Live',
    description: '스포츠 라이브의 모든 게시판을 한눈에 확인하세요',
    type: 'website',
  }
}

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

async function getBoardsWithPosts() {
  const boardRepo = new BoardCategoryRepository()
  const postRepo = new PostRepository()
  
  const categories = await boardRepo.findActive()
  const sections = []
  
  for (const category of categories) {
    const result = await postRepo.findByFilters(
      { categorySlug: category.slug },
      { limit: 6, orderBy: 'createdAt', order: 'desc' }
    )
    
    if (result.data.length > 0) {
      sections.push({
        category: {
          id: category.id,
          slug: category.slug,
          name: category.name,
          icon: category.icon,
          color: category.color
        },
        posts: result.data.map(post => ({
          id: post.id,
          title: post.title,
          boardType: post.boardType,
          category: post.category,
          author: {
            username: post.user.username,
            level: post.user.level
          },
          stats: {
            views: post.views,
            comments: post._count.comments
          },
          createdAt: post.createdAt.toISOString()
        }))
      })
    }
  }
  
  return sections
}

export default async function PostsPageSSR() {
  const boardSections = await getBoardsWithPosts()

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">게시판</h1>
            <p className="mt-2 text-gray-400">모든 게시판의 최근 글을 한눈에 확인하세요</p>
          </div>

          {boardSections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">아직 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {boardSections.map((section) => (
                <div key={section.category.id} className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden h-fit">
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
                    {section.posts.slice(0, 5).map((post: Post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${section.category.slug}/${post.id}`}
                        className="block px-6 py-3 hover:bg-dark-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-gray-100 hover:text-gold-500 transition-colors truncate font-medium">
                              {post.title}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span className="font-medium">{post.author.username}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">조회 {post.stats.views}</span>
                              {post.stats.comments > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-gold-500 font-medium">댓글 {post.stats.comments}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500 hidden sm:block">
                            <div className="font-medium text-gray-400">{post.stats.views}</div>
                            <div className="text-[10px]">조회</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {section.posts.length > 5 && (
                      <Link
                        href={`/posts/${section.category.slug}`}
                        className="block px-6 py-3 text-center text-sm text-gold-500 hover:text-gold-400 hover:bg-dark-700/30 transition-colors"
                      >
                        {section.posts.length - 5}개 게시글 더보기
                      </Link>
                    )}
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