'use client'

import { useState, useEffect } from 'react'

interface RatingStatsProps {
  partnerId: number
  initialAvgRating: number
  initialTotalRatings: number
  refreshKey?: number
}

export default function RatingStats({ 
  partnerId, 
  initialAvgRating, 
  initialTotalRatings,
  refreshKey = 0
}: RatingStatsProps) {
  const [avgRating, setAvgRating] = useState(initialAvgRating)
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings)

  useEffect(() => {
    const fetchRatingStats = async () => {
      try {
        const response = await fetch(`/api/partners/${partnerId}/rating`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setAvgRating(data.data.avgRating || 0)
          setTotalRatings(data.data.totalRatings || 0)
        }
      } catch (error) {
        console.error('Failed to fetch rating stats:', error)
      }
    }
    
    // Fetch fresh stats when refreshKey changes
    if (refreshKey > 0) {
      fetchRatingStats()
    }
  }, [partnerId, refreshKey])

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
    <div className="text-center">
      <div className="text-4xl font-bold text-gold-500 mb-2">
        {avgRating.toFixed(1)}
      </div>
      <div className="flex justify-center mb-2">
        {renderStars(avgRating)}
      </div>
      <p className="text-sm text-gray-400">
        {totalRatings}명이 평가
      </p>
    </div>
  )
}