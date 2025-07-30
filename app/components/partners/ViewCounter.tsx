'use client'

import { useEffect, useRef } from 'react'

interface ViewCounterProps {
  partnerId: number
}

export default function ViewCounter({ partnerId }: ViewCounterProps) {
  const hasIncrementedRef = useRef(false)

  useEffect(() => {
    // 이미 조회수를 증가시켰다면 중복 실행 방지
    if (hasIncrementedRef.current) {
      return
    }

    // 조회수 증가 API 호출
    fetch(`/api/partners/${partnerId}/view`, {
      method: 'POST'
    })
      .then(() => {
        hasIncrementedRef.current = true
      })
      .catch(console.error)
  }, [partnerId])

  return null
}