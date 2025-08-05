'use client'

import { useEffect } from 'react'

interface ViewCounterProps {
  partnerId: number
}

export default function ViewCounter({ partnerId }: ViewCounterProps) {
  useEffect(() => {
    // sessionStorage를 사용하여 중복 조회 방지
    const viewedKey = `partner_viewed_${partnerId}`
    
    // 이미 조회한 보증업체인지 확인
    if (typeof window !== 'undefined' && sessionStorage.getItem(viewedKey)) {
      return
    }

    // 조회수 증가 API 호출
    fetch(`/api/partners/${partnerId}/view`, {
      method: 'POST'
    })
      .then((res) => {
        if (res.ok && typeof window !== 'undefined') {
          // 성공적으로 조회수를 증가시킨 경우에만 sessionStorage에 저장
          sessionStorage.setItem(viewedKey, 'true')
        }
      })
      .catch(console.error)
  }, [partnerId])

  return null
}