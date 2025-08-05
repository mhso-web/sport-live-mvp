'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface RatingModalProps {
  partnerId: number
  partnerName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RatingModal({ 
  partnerId, 
  partnerName,
  isOpen, 
  onClose,
  onSuccess 
}: RatingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 기존 평점 불러오기
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchUserRating()
    }
  }, [isOpen, session])

  const fetchUserRating = async () => {
    try {
      const response = await fetch(`/api/partners/${partnerId}/rating`)
      const data = await response.json()
      
      if (data.success && data.data.hasRated) {
        setRating(data.data.rating)
        setComment(data.data.comment || '')
      }
    } catch (error) {
      console.error('Failed to fetch rating:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (rating === 0) {
      setError('평점을 선택해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/partners/${partnerId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
        router.refresh()
      } else {
        setError(data.error || '평점 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      setError('평점 등록 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* 모달 배경 */}
      <div 
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            {partnerName} 평가하기
          </h3>

          <form onSubmit={handleSubmit}>
            {/* 별점 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                평점을 선택해주세요
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-4xl transition-colors"
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-gold-500'
                          : 'text-gray-600'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-gray-400">
                {rating > 0 && `${rating}점`}
              </div>
            </div>

            {/* 코멘트 입력 */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                한줄평 (선택사항)
              </label>
              <input
                type="text"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="평가에 대한 간단한 설명을 남겨주세요"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                maxLength={100}
              />
              <p className="mt-1 text-sm text-gray-500 text-right">
                {comment.length}/100
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || rating === 0}
              >
                {isLoading ? '처리중...' : '평가하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}