'use client'

import { useState, useEffect, useLayoutEffect } from 'react'

interface ViewCountDisplayProps {
  postId: number
  initialViews: number
}

export default function ViewCountDisplay({ postId, initialViews }: ViewCountDisplayProps) {
  // Use sessionStorage value if available to prevent flicker
  const getInitialViews = () => {
    if (typeof window === 'undefined') return initialViews
    
    const viewCountKey = `post_view_count_${postId}`
    const storedCount = sessionStorage.getItem(viewCountKey)
    
    if (storedCount) {
      const count = parseInt(storedCount, 10)
      if (!isNaN(count) && count >= initialViews) {
        return count
      }
    }
    
    return initialViews
  }

  const [views, setViews] = useState(getInitialViews)

  // Use useLayoutEffect to update immediately before paint
  useLayoutEffect(() => {
    // Check if this post was just viewed in this session
    const viewedKey = `post_viewed_${postId}`
    const viewCountKey = `post_view_count_${postId}`
    
    if (typeof window !== 'undefined') {
      const wasViewed = sessionStorage.getItem(viewedKey)
      const storedCount = sessionStorage.getItem(viewCountKey)
      
      if (wasViewed && storedCount) {
        // Use the stored count if we have it
        const count = parseInt(storedCount, 10)
        if (!isNaN(count) && count >= initialViews) {
          setViews(count)
        }
      }
    }
  }, [postId, initialViews])

  // Listen for storage events to update view count in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = () => {
      const viewCountKey = `post_view_count_${postId}`
      const storedCount = sessionStorage.getItem(viewCountKey)
      
      if (storedCount) {
        const count = parseInt(storedCount, 10)
        if (!isNaN(count) && count >= views) {
          setViews(count)
        }
      }
    }

    // Check for updates periodically (since storage events don't fire in the same tab)
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [postId, views])

  return <span>조회 {views.toLocaleString()}</span>
}