import { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ViewCounter from '@/components/partners/ViewCounter'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const partner = await prisma.partner.findUnique({
    where: { id: parseInt(params.id) }
  })

  if (!partner) {
    return {
      title: '보증업체를 찾을 수 없습니다 - Sports Live',
      description: '요청하신 보증업체 정보를 찾을 수 없습니다.'
    }
  }

  return {
    title: `${partner.name} - Sports Live 보증업체`,
    description: partner.description || `${partner.name}의 상세 정보를 확인하세요.`,
    keywords: ['스포츠 베팅', '보증업체', partner.name, '스포츠 라이브'],
  }
}

async function getPartner(id: number) {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          ratings: true,
          comments: true,
          likes: true
        }
      }
    }
  })

  if (!partner) return null

  // 평균 평점 계산
  const avgRating = partner.ratings.length > 0
    ? partner.ratings.reduce((sum, rating) => sum + rating.rating, 0) / partner.ratings.length
    : 0

  return {
    ...partner,
    avgRating,
    totalRatings: partner._count.ratings,
    totalComments: partner._count.comments,
    totalLikes: partner._count.likes
  }
}

export default async function PartnerDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const partner = await getPartner(id)
  if (!partner) {
    notFound()
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-gold-500">★</span>)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-gold-500">☆</span>)
      } else {
        stars.push(<span key={i} className="text-gray-600">★</span>)
      }
    }
    return stars
  }

  return (
    <>
      <Navigation />
      <ViewCounter partnerId={partner.id} />
      <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <Link 
              href="/partners"
              className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              보증업체 목록으로
            </Link>
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-100">{partner.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  조회수 {partner.viewCount.toLocaleString()}
                </div>
                {partner.isActive && (
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                    활성
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 배너 이미지 */}
          <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 to-dark-900/80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-30">🏢</span>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽 메인 콘텐츠 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 설명 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">업체 소개</h2>
                <p className="text-gray-300">{partner.description}</p>
              </div>

              {/* 상세 내용 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{ 
                      __html: partner.detailContent.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  댓글 ({partner.totalComments})
                </h3>
                
                {partner.comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {partner.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-dark-700 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-300">
                            {comment.user.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-400">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="space-y-6">
              {/* 평점 카드 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">평점</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-500 mb-2">
                    {partner.avgRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(partner.avgRating)}
                  </div>
                  <p className="text-sm text-gray-400">
                    {partner.totalRatings}명이 평가
                  </p>
                </div>
              </div>

              {/* 통계 카드 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">통계</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">댓글</span>
                    <span className="text-gray-300">{partner.totalComments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">좋아요</span>
                    <span className="text-gray-300">{partner.totalLikes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">조회수</span>
                    <span className="text-gray-300">{partner.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 웹사이트 링크 */}
              {partner.websiteUrl && (
                <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">웹사이트</h3>
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium inline-flex items-center justify-center w-full"
                  >
                    방문하기
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors">
                    평점 남기기
                  </button>
                  <button className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">
                    댓글 작성
                  </button>
                  <button className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors flex items-center justify-center">
                    <span className="mr-2">👍</span>
                    좋아요
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}