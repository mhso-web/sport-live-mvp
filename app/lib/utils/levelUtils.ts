// 레벨별 티어 정의
export const getTierInfo = (level: number) => {
  if (level >= 20) return { tier: 'master', name: '마스터', color: 'from-purple-400 to-pink-400' }
  if (level >= 16) return { tier: 'platinum', name: '플래티넘', color: 'from-gray-300 to-gray-100' }
  if (level >= 11) return { tier: 'gold', name: '골드', color: 'from-yellow-400 to-yellow-300' }
  if (level >= 6) return { tier: 'silver', name: '실버', color: 'from-gray-400 to-gray-300' }
  return { tier: 'bronze', name: '브론즈', color: 'from-orange-500 to-orange-400' }
}

// 레벨별 닉네임 색상 클래스
export const getLevelColorClass = (level: number) => {
  const tierInfo = getTierInfo(level)
  switch (tierInfo.tier) {
    case 'master':
      return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
    case 'platinum':
      return 'text-gray-100'
    case 'gold':
      return 'text-gold-400'
    case 'silver':
      return 'text-gray-300'
    case 'bronze':
    default:
      return 'text-orange-400'
  }
}

// 레벨별 배지 정보
export const getLevelBadge = (level: number): { icon: string; name: string; description: string } | null => {
  // 특정 레벨 달성 배지
  const badges: Record<number, { icon: string; name: string; description: string }> = {
    2: { icon: '🌱', name: '초보 팬', description: '레벨 2 달성' },
    5: { icon: '🔥', name: '열정 팬', description: '레벨 5 달성' },
    7: { icon: '⭐', name: '베테랑 팬', description: '레벨 7 달성' },
    10: { icon: '🥈', name: '실버 마스터', description: '레벨 10 달성' },
    12: { icon: '🏆', name: '골드 팬', description: '레벨 12 달성' },
    15: { icon: '🥇', name: '골드 마스터', description: '레벨 15 달성' },
    17: { icon: '💎', name: '플래티넘 팬', description: '레벨 17 달성' },
    20: { icon: '👑', name: '레전드', description: '레벨 20 달성' },
    25: { icon: '🌟', name: '그랜드 마스터', description: '레벨 25 달성' },
    30: { icon: '🏅', name: '챔피언', description: '레벨 30 달성' },
    40: { icon: '🔱', name: '전설의 팬', description: '레벨 40 달성' },
    50: { icon: '⚡', name: '신화', description: '레벨 50 달성' }
  }
  
  // 현재 레벨에 해당하는 가장 높은 배지 찾기
  let highestBadge = null
  for (const [badgeLevel, badge] of Object.entries(badges)) {
    if (level >= parseInt(badgeLevel)) {
      highestBadge = badge
    }
  }
  
  return highestBadge
}

// 게시글 테두리 스타일
export const getPostBorderClass = (authorLevel: number) => {
  const tierInfo = getTierInfo(authorLevel)
  
  // 레벨 10 이상만 특별 테두리
  if (authorLevel < 10) return ''
  
  switch (tierInfo.tier) {
    case 'master':
      return 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-dark-800'
    case 'platinum':
      return 'ring-1 ring-gray-400/50'
    case 'gold':
      return 'ring-1 ring-gold-500/50'
    case 'silver':
      return 'ring-1 ring-gray-500/30'
    default:
      return ''
  }
}

// 댓글 쿨타임 (초)
export const getCommentCooldown = (level: number) => {
  if (level >= 20) return 5    // 마스터: 5초
  if (level >= 15) return 10   // 골드 마스터: 10초
  if (level >= 10) return 15   // 실버 마스터: 15초
  if (level >= 5) return 20    // 열정 팬: 20초
  if (level >= 3) return 25    // 레벨 3+: 25초
  return 30                     // 기본: 30초
}