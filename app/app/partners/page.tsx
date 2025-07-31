'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Partner {
  id: number
  name: string
  description: string
  bannerImage: string
  avgRating: number
  totalRatings: number
  totalComments: number
  totalLikes: number
}

type SortOption = 'latest' | 'rating' | 'popular'

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPartners()
  }, [sortBy])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partners?sortBy=${sortBy}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setPartners(data.data)
      } else {
        setPartners([])
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error)
      setPartners([])
    } finally {
      setLoading(false)
    }
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

  const sortOptions = [
    { value: 'latest', label: '최신순', icon: '🕒' },
    { value: 'rating', label: '별점순', icon: '⭐' },
    { value: 'popular', label: '인기순', icon: '🔥' }
  ]

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setIsDropdownOpen(false)
  }

  return (
    <main className="min-h-screen bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">보증업체</h1>
            <p className="mt-2 text-gray-400">검증된 파트너사들을 만나보세요</p>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex justify-end mb-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-gray-300 hover:border-gold-600/50 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-200 cursor-pointer flex items-center space-x-2 min-w-[140px]"
              >
                <span className="mr-1">
                  {sortOptions.find(opt => opt.value === sortBy)?.icon}
                </span>
                <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <svg 
                  className={`w-4 h-4 ml-auto transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value as SortOption)}
                      className={`w-full px-4 py-3 text-left hover:bg-dark-700 hover:text-gold-500 transition-colors flex items-center space-x-2 ${
                        sortBy === option.value ? 'bg-dark-700/50 text-gold-500' : 'text-gray-300'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <svg className="w-4 h-4 ml-auto text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 파트너 목록 */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">등록된 보증업체가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={`/partners/${partner.id}`}
                  className="group"
                >
                  <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden hover:border-gold-600/50 transition-all duration-300 hover-lift">
                    {/* 배너 이미지 */}
                    <div className="aspect-video bg-dark-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 to-dark-900/80"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-50">🏢</span>
                      </div>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-gold-500 transition-colors">
                        {partner.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {partner.description}
                      </p>

                      {/* 평점 */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex">
                          {renderStars(partner.avgRating)}
                        </div>
                        <span className="text-sm text-gray-400">
                          {partner.avgRating.toFixed(1)} ({partner.totalRatings}명)
                        </span>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>{partner.totalComments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>👍</span>
                          <span>{partner.totalLikes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
  )
}