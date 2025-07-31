export const BADGE_TYPES = {
  // 게시글 관련
  FIRST_POST: 'first_post',
  POST_10: 'post_10',
  POST_50: 'post_50',
  POST_100: 'post_100',
  
  // 댓글 관련
  FIRST_COMMENT: 'first_comment',
  COMMENT_10: 'comment_10',
  COMMENT_50: 'comment_50',
  COMMENT_100: 'comment_100',
  
  // 좋아요 관련
  LIKE_RECEIVED_10: 'like_received_10',
  LIKE_RECEIVED_50: 'like_received_50',
  LIKE_RECEIVED_100: 'like_received_100',
  
  // 레벨 관련
  LEVEL_5: 'level_5',
  LEVEL_10: 'level_10',
  LEVEL_15: 'level_15',
  LEVEL_20: 'level_20',
  
  // 특별 뱃지
  EARLY_ADOPTER: 'early_adopter', // 초기 회원
  DAILY_LOGIN_7: 'daily_login_7', // 7일 연속 로그인
  DAILY_LOGIN_30: 'daily_login_30', // 30일 연속 로그인
} as const

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES]

export interface BadgeInfo {
  type: BadgeType
  name: string
  description: string
  icon: string
  level: number // 1: 브론즈, 2: 실버, 3: 골드, 4: 플래티넘
  category: 'activity' | 'level' | 'special'
}

export const BADGE_INFO: Record<BadgeType, BadgeInfo> = {
  // 게시글 관련
  [BADGE_TYPES.FIRST_POST]: {
    type: BADGE_TYPES.FIRST_POST,
    name: '첫 게시글',
    description: '첫 게시글을 작성했습니다',
    icon: '✍️',
    level: 1,
    category: 'activity'
  },
  [BADGE_TYPES.POST_10]: {
    type: BADGE_TYPES.POST_10,
    name: '게시글 10개',
    description: '게시글 10개를 작성했습니다',
    icon: '📝',
    level: 2,
    category: 'activity'
  },
  [BADGE_TYPES.POST_50]: {
    type: BADGE_TYPES.POST_50,
    name: '게시글 50개',
    description: '게시글 50개를 작성했습니다',
    icon: '📚',
    level: 3,
    category: 'activity'
  },
  [BADGE_TYPES.POST_100]: {
    type: BADGE_TYPES.POST_100,
    name: '게시글 마스터',
    description: '게시글 100개를 작성했습니다',
    icon: '🏆',
    level: 4,
    category: 'activity'
  },
  
  // 댓글 관련
  [BADGE_TYPES.FIRST_COMMENT]: {
    type: BADGE_TYPES.FIRST_COMMENT,
    name: '첫 댓글',
    description: '첫 댓글을 작성했습니다',
    icon: '💬',
    level: 1,
    category: 'activity'
  },
  [BADGE_TYPES.COMMENT_10]: {
    type: BADGE_TYPES.COMMENT_10,
    name: '댓글 10개',
    description: '댓글 10개를 작성했습니다',
    icon: '🗨️',
    level: 2,
    category: 'activity'
  },
  [BADGE_TYPES.COMMENT_50]: {
    type: BADGE_TYPES.COMMENT_50,
    name: '댓글 50개',
    description: '댓글 50개를 작성했습니다',
    icon: '💭',
    level: 3,
    category: 'activity'
  },
  [BADGE_TYPES.COMMENT_100]: {
    type: BADGE_TYPES.COMMENT_100,
    name: '댓글 마스터',
    description: '댓글 100개를 작성했습니다',
    icon: '🎯',
    level: 4,
    category: 'activity'
  },
  
  // 좋아요 관련
  [BADGE_TYPES.LIKE_RECEIVED_10]: {
    type: BADGE_TYPES.LIKE_RECEIVED_10,
    name: '인기 상승',
    description: '좋아요를 10개 받았습니다',
    icon: '👍',
    level: 2,
    category: 'activity'
  },
  [BADGE_TYPES.LIKE_RECEIVED_50]: {
    type: BADGE_TYPES.LIKE_RECEIVED_50,
    name: '인기 작성자',
    description: '좋아요를 50개 받았습니다',
    icon: '❤️',
    level: 3,
    category: 'activity'
  },
  [BADGE_TYPES.LIKE_RECEIVED_100]: {
    type: BADGE_TYPES.LIKE_RECEIVED_100,
    name: '인기 스타',
    description: '좋아요를 100개 받았습니다',
    icon: '⭐',
    level: 4,
    category: 'activity'
  },
  
  // 레벨 관련
  [BADGE_TYPES.LEVEL_5]: {
    type: BADGE_TYPES.LEVEL_5,
    name: '실버 달성',
    description: '레벨 5를 달성했습니다',
    icon: '🥈',
    level: 2,
    category: 'level'
  },
  [BADGE_TYPES.LEVEL_10]: {
    type: BADGE_TYPES.LEVEL_10,
    name: '골드 달성',
    description: '레벨 10을 달성했습니다',
    icon: '🏆',
    level: 3,
    category: 'level'
  },
  [BADGE_TYPES.LEVEL_15]: {
    type: BADGE_TYPES.LEVEL_15,
    name: '다이아몬드 달성',
    description: '레벨 15를 달성했습니다',
    icon: '💎',
    level: 3,
    category: 'level'
  },
  [BADGE_TYPES.LEVEL_20]: {
    type: BADGE_TYPES.LEVEL_20,
    name: '마스터 달성',
    description: '레벨 20을 달성했습니다',
    icon: '👑',
    level: 4,
    category: 'level'
  },
  
  // 특별 뱃지
  [BADGE_TYPES.EARLY_ADOPTER]: {
    type: BADGE_TYPES.EARLY_ADOPTER,
    name: '얼리 어답터',
    description: '초기 회원입니다',
    icon: '🌟',
    level: 3,
    category: 'special'
  },
  [BADGE_TYPES.DAILY_LOGIN_7]: {
    type: BADGE_TYPES.DAILY_LOGIN_7,
    name: '일주일 개근',
    description: '7일 연속 로그인했습니다',
    icon: '📅',
    level: 2,
    category: 'special'
  },
  [BADGE_TYPES.DAILY_LOGIN_30]: {
    type: BADGE_TYPES.DAILY_LOGIN_30,
    name: '한달 개근',
    description: '30일 연속 로그인했습니다',
    icon: '🗓️',
    level: 4,
    category: 'special'
  }
}

export const getBadgeColor = (level: number) => {
  switch (level) {
    case 1: return 'text-orange-400 bg-orange-900/20' // 브론즈
    case 2: return 'text-gray-300 bg-gray-700/30' // 실버
    case 3: return 'text-yellow-400 bg-yellow-900/20' // 골드
    case 4: return 'text-purple-400 bg-purple-900/20' // 플래티넘
    default: return 'text-gray-400 bg-gray-800'
  }
}