'use client'

import { useState } from 'react'
import Link from 'next/link'
import RatingModal from './RatingModal'
import RatingStats from './RatingStats'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import PartnerLikeButton from './PartnerLikeButton'

interface PartnerDetailContentProps {
  partner: any
}

export default function PartnerDetailContent({ partner }: PartnerDetailContentProps) {
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)


  const handleRatingSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleCommentSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
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
          {partner.bannerImage ? (
            <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden mb-8">
              <img 
                src={partner.bannerImage} 
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 to-dark-900/80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl opacity-30">🏢</span>
              </div>
            </div>
          )}

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
              {partner.detailContent && (
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
              )}

              {/* 댓글 섹션 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  댓글 ({partner.totalComments})
                </h3>
                
                {/* 댓글 입력 폼 */}
                <CommentForm 
                  partnerId={partner.id} 
                  onSuccess={handleCommentSuccess}
                />
                
                {/* 댓글 목록 */}
                <CommentList
                  key={refreshKey}
                  partnerId={partner.id}
                  initialComments={partner.comments}
                  totalComments={partner.totalComments}
                />
              </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="space-y-6">
              {/* 평점 카드 */}
              <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">평점</h3>
                <RatingStats
                  partnerId={partner.id}
                  initialAvgRating={partner.avgRating}
                  initialTotalRatings={partner.totalRatings}
                  refreshKey={refreshKey}
                />
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
                  <button 
                    onClick={() => setShowRatingModal(true)}
                    className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors"
                  >
                    평점 남기기
                  </button>
                  
                  <PartnerLikeButton
                    partnerId={partner.id}
                    initialLikeCount={partner.totalLikes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 평점 모달 */}
      <RatingModal
        partnerId={partner.id}
        partnerName={partner.name}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSuccess={handleRatingSuccess}
      />
    </>
  )
}