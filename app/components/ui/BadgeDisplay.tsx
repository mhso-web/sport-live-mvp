'use client'

import { BADGE_INFO, getBadgeColor, type BadgeType } from '@/lib/constants/badges'
import type { UserBadge } from '@prisma/client'

interface BadgeDisplayProps {
  badge: UserBadge
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export default function BadgeDisplay({ badge, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const badgeInfo = BADGE_INFO[badge.badgeType as BadgeType]
  
  if (!badgeInfo) {
    return null
  }

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  }

  const iconSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <div className="relative group inline-block">
      <div className={`
        inline-flex items-center gap-1.5 rounded-full
        ${getBadgeColor(badgeInfo.level)}
        ${sizeClasses[size]}
        transition-transform hover:scale-105
      `}>
        <span className={iconSizeClasses[size]}>{badgeInfo.icon}</span>
        <span className="font-medium">{badgeInfo.name}</span>
      </div>
      
      {showTooltip && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-200 z-10
        ">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 whitespace-nowrap">
            <p className="font-semibold mb-1">{badgeInfo.name}</p>
            <p className="text-gray-300">{badgeInfo.description}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}