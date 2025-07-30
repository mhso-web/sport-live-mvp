import { getLevelBadge } from '@/lib/utils/levelUtils'

interface UserBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

export default function UserBadge({ level, size = 'md' }: UserBadgeProps) {
  const badge = getLevelBadge(level)
  
  if (!badge) return null
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  
  return (
    <div 
      className={`inline-flex items-center gap-1 bg-dark-700/50 border border-dark-600 rounded-full ${sizeClasses[size]}`}
      title={badge.description}
    >
      <span className="text-base">{badge.icon}</span>
      <span className="text-gray-300 font-medium">{badge.name}</span>
    </div>
  )
}