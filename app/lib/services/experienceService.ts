import { prisma } from '@/lib/prisma'

export type ExperienceActionType = 
  | 'POST_CREATE'       // 게시글 작성
  | 'COMMENT_CREATE'    // 댓글 작성
  | 'POST_LIKE'         // 게시글 좋아요
  | 'COMMENT_LIKE'      // 댓글 좋아요
  | 'RECEIVED_LIKE'     // 좋아요 받음
  | 'DAILY_LOGIN'       // 일일 로그인
  | 'PROFILE_COMPLETE'  // 프로필 완성
  | 'FIRST_POST'        // 첫 게시글
  | 'POST_VIEWS_100'    // 게시글 조회수 100
  | 'POST_VIEWS_1000'   // 게시글 조회수 1000

// 경험치 테이블
const EXPERIENCE_TABLE: Record<ExperienceActionType, number> = {
  POST_CREATE: 10,
  COMMENT_CREATE: 5,
  POST_LIKE: 2,
  COMMENT_LIKE: 2,
  RECEIVED_LIKE: 3,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETE: 50,
  FIRST_POST: 20,
  POST_VIEWS_100: 30,
  POST_VIEWS_1000: 100,
}

// 레벨별 필요 경험치 (레벨 1->2는 100, 2->3은 200 등)
const LEVEL_EXPERIENCE_TABLE = [
  0,     // 레벨 1 (시작)
  100,   // 레벨 2
  300,   // 레벨 3
  600,   // 레벨 4
  1000,  // 레벨 5
  1500,  // 레벨 6
  2100,  // 레벨 7
  2800,  // 레벨 8
  3600,  // 레벨 9
  4500,  // 레벨 10
  5500,  // 레벨 11
  6600,  // 레벨 12
  7800,  // 레벨 13
  9100,  // 레벨 14
  10500, // 레벨 15
  12000, // 레벨 16
  13600, // 레벨 17
  15300, // 레벨 18
  17100, // 레벨 19
  19000, // 레벨 20
  // 20레벨 이후는 2000씩 증가
]

export class ExperienceService {
  // 레벨 계산
  static calculateLevel(totalExperience: number): number {
    let level = 1
    let accumulatedExp = 0
    
    for (let i = 1; i < LEVEL_EXPERIENCE_TABLE.length; i++) {
      if (totalExperience >= LEVEL_EXPERIENCE_TABLE[i]) {
        level = i + 1
      } else {
        break
      }
    }
    
    // 20레벨 이상
    if (level === 20) {
      const expAfter20 = totalExperience - LEVEL_EXPERIENCE_TABLE[19]
      const levelsAfter20 = Math.floor(expAfter20 / 2000)
      level = 20 + levelsAfter20
    }
    
    return level
  }
  
  // 현재 레벨에서 다음 레벨까지 필요한 경험치
  static getExperienceForNextLevel(currentLevel: number): number {
    if (currentLevel < 20) {
      return LEVEL_EXPERIENCE_TABLE[currentLevel] || 0
    }
    // 20레벨 이상은 2000씩
    return LEVEL_EXPERIENCE_TABLE[19] + ((currentLevel - 19) * 2000)
  }
  
  // 현재 레벨 진행률 계산 (0-100)
  static calculateLevelProgress(totalExperience: number, currentLevel: number): number {
    const currentLevelExp = currentLevel === 1 ? 0 : ExperienceService.getExperienceForNextLevel(currentLevel - 1)
    const nextLevelExp = ExperienceService.getExperienceForNextLevel(currentLevel)
    const levelExp = nextLevelExp - currentLevelExp
    const progressExp = totalExperience - currentLevelExp
    
    return Math.floor((progressExp / levelExp) * 100)
  }
  
  // 경험치 부여
  static async awardExperience(
    userId: number, 
    actionType: ExperienceActionType,
    metadata?: Record<string, any>
  ): Promise<{
    experienceGained: number
    newTotalExperience: number
    previousLevel: number
    newLevel: number
    leveledUp: boolean
  }> {
    console.log(`[ExperienceService] Awarding experience: userId=${userId}, action=${actionType}`)
    
    const experienceGained = EXPERIENCE_TABLE[actionType] || 0
    
    if (experienceGained === 0) {
      throw new Error(`Invalid action type: ${actionType}`)
    }
    
    // 트랜잭션으로 처리
    return await prisma.$transaction(async (tx) => {
      // 현재 사용자 정보 조회
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { experience: true, level: true }
      })
      
      if (!user) {
        throw new Error('User not found')
      }
      
      const previousLevel = user.level
      const newTotalExperience = user.experience + experienceGained
      const newLevel = ExperienceService.calculateLevel(newTotalExperience)
      const leveledUp = newLevel > previousLevel
      
      // 사용자 경험치 및 레벨 업데이트
      await tx.user.update({
        where: { id: userId },
        data: {
          experience: newTotalExperience,
          level: newLevel
        }
      })
      
      // 경험치 로그 기록
      await tx.userExperienceLog.create({
        data: {
          userId,
          actionType,
          experienceGained,
          description: ExperienceService.getActionDescription(actionType),
          metadata
        }
      })
      
      return {
        experienceGained,
        newTotalExperience,
        previousLevel,
        newLevel,
        leveledUp
      }
    })
  }
  
  // 특정 게시글에 이미 댓글로 경험치를 받았는지 확인
  static async hasReceivedCommentExperience(userId: number, postId: number): Promise<boolean> {
    const existingLog = await prisma.userExperienceLog.findFirst({
      where: {
        userId,
        actionType: 'COMMENT_CREATE',
        metadata: {
          path: ['postId'],
          equals: postId
        }
      }
    })
    
    return !!existingLog
  }
  
  // 일일 로그인 보상 체크 및 부여
  static async checkDailyLogin(userId: number): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 오늘 이미 로그인 보상을 받았는지 확인
    const existingLog = await prisma.userExperienceLog.findFirst({
      where: {
        userId,
        actionType: 'DAILY_LOGIN',
        createdAt: {
          gte: today
        }
      }
    })
    
    if (existingLog) {
      return false // 이미 받음
    }
    
    // 보상 부여
    await ExperienceService.awardExperience(userId, 'DAILY_LOGIN')
    return true
  }
  
  // 사용자 경험치 통계
  static async getUserExperienceStats(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        experience: true,
        level: true,
        experienceLogs: {
          select: {
            actionType: true,
            experienceGained: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const nextLevelExp = ExperienceService.getExperienceForNextLevel(user.level)
    const currentLevelExp = user.level === 1 ? 0 : ExperienceService.getExperienceForNextLevel(user.level - 1)
    const progress = ExperienceService.calculateLevelProgress(user.experience, user.level)
    
    return {
      currentLevel: user.level,
      totalExperience: user.experience,
      currentLevelExperience: user.experience - currentLevelExp,
      experienceForNextLevel: nextLevelExp - currentLevelExp,
      progressPercentage: progress,
      recentActivities: user.experienceLogs
    }
  }
  
  // 액션 설명 텍스트
  private static getActionDescription(actionType: ExperienceActionType): string {
    const descriptions: Record<ExperienceActionType, string> = {
      POST_CREATE: '게시글 작성',
      COMMENT_CREATE: '댓글 작성',
      POST_LIKE: '게시글 좋아요',
      COMMENT_LIKE: '댓글 좋아요',
      RECEIVED_LIKE: '좋아요 받음',
      DAILY_LOGIN: '일일 로그인 보상',
      PROFILE_COMPLETE: '프로필 완성',
      FIRST_POST: '첫 게시글 작성',
      POST_VIEWS_100: '게시글 조회수 100 달성',
      POST_VIEWS_1000: '게시글 조회수 1000 달성',
    }
    
    return descriptions[actionType] || '활동 보상'
  }
}