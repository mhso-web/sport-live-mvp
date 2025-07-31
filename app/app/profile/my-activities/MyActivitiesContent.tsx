'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { RecentPost, RecentComment, UserStats } from '@/lib/repositories/userRepository'
import Pagination from '@/components/ui/Pagination'

interface Props {
  posts: RecentPost[]
  comments: RecentComment[]
  stats: UserStats
  activeTab: 'posts' | 'comments'
  currentPage: number
  totalPages: number
}

export default function MyActivitiesContent({ 
  posts, 
  comments, 
  stats, 
  activeTab,
  currentPage,
  totalPages 
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (tab: 'posts' | 'comments') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    params.delete('page') // 탭 변경 시 페이지를 1로 리셋
    router.push(`/profile/my-activities?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/profile/my-activities?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-6">내 활동 내역</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.postCount}</div>
          <div className="text-gray-400">작성한 게시글</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.commentCount}</div>
          <div className="text-gray-400">작성한 댓글</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.likeReceivedCount}</div>
          <div className="text-gray-400">받은 좋아요</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalViews}</div>
          <div className="text-gray-400">총 조회수</div>
        </div>
      </div>

      {/* 경험치 내역 버튼 */}
      <div className="mb-6 text-center">
        <Link
          href="/profile/experience"
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <span className="text-lg">🏆</span>
          <span>경험치 획득 내역 보기</span>
        </Link>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'posts'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              내가 쓴 글 ({stats.postCount})
            </button>
            <button
              onClick={() => handleTabChange('comments')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'comments'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              내가 쓴 댓글 ({stats.commentCount})
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'posts' ? (
            <div className="space-y-3">
              {posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      <h3 className="font-semibold text-white mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {post.boardCategory && (
                          <span className="text-yellow-400">[{post.boardCategory.name}]</span>
                        )}
                        <span>조회 {post.views}</span>
                        <span>좋아요 {post.likeCount}</span>
                        <span>댓글 {post.commentCount}</span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">아직 작성한 게시글이 없습니다.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.length > 0 ? (
                <>
                  {comments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/posts/${comment.post.id}`}
                      className="block p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      <p className="text-gray-300 mb-2">{comment.content}</p>
                      <div className="text-sm text-gray-400">
                        <span className="text-yellow-400">게시글: {comment.post.title}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">아직 작성한 댓글이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}