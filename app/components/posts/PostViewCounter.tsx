'use client'

import { useEffect } from 'react'

interface PostViewCounterProps {
  postId: number
}

export default function PostViewCounter({ postId }: PostViewCounterProps) {
  useEffect(() => {
    // 조회수 증가 API 호출
    fetch(`/api/posts/${postId}/view`, {
      method: 'POST'
    }).catch(console.error)
  }, [postId])

  return null
}