'use client'

import { useEffect, useState } from 'react'
import { getTierInfo } from '@/lib/utils/levelUtils'

interface LevelUpNotificationProps {
  show: boolean
  previousLevel: number
  newLevel: number
  onClose: () => void
}

export default function LevelUpNotification({ 
  show, 
  previousLevel, 
  newLevel, 
  onClose 
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const newTier = getTierInfo(newLevel)
  const previousTier = getTierInfo(previousLevel)
  const tierChanged = newTier.tier !== previousTier.tier
  
  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // 애니메이션 완료 후 닫기
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])
  
  if (!show) return null
  
  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className="bg-dark-800 border border-gold-500 rounded-lg shadow-2xl p-6 min-w-[320px]">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-gold-400 mb-2">레벨 업!</h3>
          <div className="text-lg text-gray-300 mb-1">
            <span className="font-medium">Lv.{previousLevel}</span>
            <span className="mx-2">→</span>
            <span className={`font-bold text-xl bg-gradient-to-r ${newTier.color} bg-clip-text text-transparent`}>
              Lv.{newLevel}
            </span>
          </div>
          {tierChanged && (
            <div className="mt-3 text-sm text-gray-400">
              <span className="font-medium text-gold-500">{newTier.name} 티어</span>로 승급하셨습니다!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}