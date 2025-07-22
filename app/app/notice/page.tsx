import { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export const metadata: Metadata = {
  title: '공지사항 - Sports Live',
  description: '스포츠 라이브의 공지사항 및 업데이트 소식을 확인하세요.',
  keywords: ['공지사항', '업데이트', '서비스 안내', '스포츠 라이브'],
}

async function getNotices() {
  const boardCategory = await prisma.boardCategory.findFirst({
    where: { boardType: 'NOTICE' }
  })

  if (!boardCategory) {
    return []
  }

  const posts = await prisma.post.findMany({
    where: {
      categoryId: boardCategory.id,
      isDeleted: false
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true
        }
      },
      _count: {
        select: {
          comments: { where: { isDeleted: false } },
          likes: true
        }
      }
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return posts
}

export default async function NoticePage() {
  const notices = await getNotices()

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 flex items-center">
              <span className="mr-3 text-gold-500">📢</span>
              공지사항
            </h1>
            <p className="mt-2 text-gray-400">스포츠 라이브의 공지사항 및 업데이트 소식입니다.</p>
          </div>

          {/* 공지사항 목록 */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            {notices.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-gray-500">아직 등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {notices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/notice/${notice.id}`}
                    className="block hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {notice.isPinned && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                </svg>
                                중요
                              </span>
                            )}
                            <h2 className="text-lg font-medium text-gray-100 hover:text-gold-500 transition-colors">
                              {notice.title}
                            </h2>
                          </div>
                          
                          {notice.summary && (
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                              {notice.summary}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="font-medium">{notice.user.username}</span>
                              {notice.user.role === 'ADMIN' && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-gold-900/30 text-gold-400 rounded">
                                  관리자
                                </span>
                              )}
                            </div>
                            <span>•</span>
                            <time dateTime={notice.createdAt.toISOString()}>
                              {formatDistanceToNow(notice.createdAt, { addSuffix: true, locale: ko })}
                            </time>
                            <span>•</span>
                            <span>조회 {notice.views.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{notice._count.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{notice._count.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 페이지네이션 추가 예정 */}
        </div>
      </main>
    </>
  )
}