'use client'

import { useEffect } from 'react'

interface ViewCounterProps {
  partnerId: number
}

export default function ViewCounter({ partnerId }: ViewCounterProps) {
  useEffect(() => {
    // 조회수 증가 API 호출
    fetch(`/api/partners/${partnerId}/view`, {
      method: 'POST'
    }).catch(console.error)
  }, [partnerId])

  return null
}