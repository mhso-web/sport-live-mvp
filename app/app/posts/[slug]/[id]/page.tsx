import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import PostViewCounter from '@/components/posts/PostViewCounter'
import PostActions from '@/components/posts/PostActions'
import CommentSection from '@/components/posts/CommentSection'
import LikeButton from '@/components/posts/LikeButton'
import UserBadge from '@/components/ui/UserBadge'
import { getLevelColorClass } from '@/lib/utils/levelUtils'
import type { Prisma } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
    id: string
  }
}

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    user: {
      select: {
        id: true
        username: true
        level: true
        role: true
      }
    }
    category: true
    comments: {
      where: { isDeleted: false; parentId: null }
      include: {
        user: {
          select: {
            id: true
            username: true
            level: true
          }
        }
        replies: {
          where: { isDeleted: false }
          include: {
            user: {
              select: {
                id: true
                username: true
                level: true
              }
            }
          }
        }
      }
    }
    _count: {
      select: {
        comments: { where: { isDeleted: false } }
        likes: true
      }
    }
  }
}>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(parseInt(params.id))

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다 - Sports Live',
      description: '요청하신 게시글을 찾을 수 없습니다.'
    }
  }

  return {
    title: `${post.title} - ${post.category?.name || '게시판'} - Sports Live`,
    description: post.summary || post.content.substring(0, 160),
    keywords: ['스포츠', '커뮤니티', post.category?.name || '', post.title],
  }
}

async function getPost(id: number): Promise<PostWithRelations | null> {
  const post = await prisma.post.findUnique({
    where: { 
      id,
      isDeleted: false 
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          level: true,
          role: true
        }
      },
      category: true,
      comments: {
        where: { 
          isDeleted: false,
          parentId: null 
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              level: true
            }
          },
          replies: {
            where: { isDeleted: false },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  level: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          comments: { where: { isDeleted: false } },
          likes: true
        }
      }
    }
  })

  return post
}

// 댓글 데이터를 재귀적으로 변환하는 헬퍼 함수
function transformComments(comments: any[]): any[] {
  return comments.map(comment => ({
    ...comment,
    replies: comment.replies ? transformComments(comment.replies) : []
  }))
}

export default async function PostDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const post = await getPost(id)
  if (!post) {
    notFound()
  }

  // 카테고리 slug 확인
  if (post.category && post.category.slug !== params.slug) {
    notFound()
  }

  return (
    <>
      <PostViewCounter postId={post.id} />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 브레드크럼 */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/posts" className="text-gray-400 hover:text-gold-500 transition-colors">
                  게시판
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li>
                <Link 
                  href={`/posts/${post.category?.slug}`} 
                  className="text-gray-400 hover:text-gold-500 transition-colors"
                >
                  {post.category?.name}
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-gray-300">{post.title}</li>
            </ol>
          </nav>

          {/* 게시글 헤더 */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <div className="p-6">
              {/* 제목 */}
              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                {post.isPinned && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50 mr-3">
                    📌 고정
                  </span>
                )}
                {post.title}
              </h1>

              {/* 작성자 정보 */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-dark-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getLevelColorClass(post.user.level)}`}>{post.user.username}</span>
                      <span className="text-xs bg-gold-900/30 text-gold-400 px-2 py-0.5 rounded">
                        Lv.{post.user.level}
                      </span>
                      <UserBadge level={post.user.level} size="sm" />
                      {post.user.role === 'ADMIN' && (
                        <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded">
                          관리자
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <time dateTime={post.createdAt.toISOString()}>
                        {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                      </time>
                      <span>•</span>
                      <span>조회 {post.views.toLocaleString()}</span>
                      <span>•</span>
                      <span>댓글 {post._count.comments}</span>
                      <span>•</span>
                      <span>좋아요 {post._count.likes}</span>
                    </div>
                  </div>
                </div>

                <PostActions postId={post.id} authorId={post.user.id} />
              </div>

              {/* 게시글 내용 */}
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/\n/g, '<br>') 
                  }}
                />
              </div>

              {/* 좋아요 버튼 */}
              <div className="mt-8 pt-6 border-t border-dark-700 flex justify-center">
                <LikeButton 
                  postId={post.id} 
                  initialLikesCount={post.likesCount} 
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <CommentSection 
            postId={post.id} 
            comments={transformComments(post.comments)} 
            commentCount={post._count.comments}
          />
        </div>
      </main>
    </>
  )
}