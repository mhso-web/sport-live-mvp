import { prisma } from '@/lib/prisma'
import { BADGE_TYPES, type BadgeType } from '@/lib/constants/badges'
import type { UserBadge } from '@prisma/client'
import { BADGE_THRESHOLDS } from '@/lib/constants/app.constants'

export class BadgeService {
  // 사용자의 모든 뱃지 조회
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    })
  }

  // 특정 뱃지 획득 여부 확인
  async hasBadge(userId: number, badgeType: BadgeType): Promise<boolean> {
    const badge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeType: {
          userId,
          badgeType
        }
      }
    })
    return !!badge
  }

  // 뱃지 부여
  async awardBadge(userId: number, badgeType: BadgeType, metadata?: any): Promise<UserBadge | null> {
    // 이미 가지고 있는 뱃지인지 확인
    const hasBadge = await this.hasBadge(userId, badgeType)
    if (hasBadge) {
      return null
    }

    // 뱃지 부여
    const badge = await prisma.userBadge.create({
      data: {
        userId,
        badgeType,
        metadata
      }
    })

    // TODO: 뱃지 획득 경험치 부여 (선택사항)
    
    return badge
  }

  // 게시글 작성 후 뱃지 체크
  async checkPostBadges(userId: number): Promise<UserBadge[]> {
    const postCount = await prisma.post.count({
      where: { userId, isDeleted: false }
    })

    const badgesToAward: BadgeType[] = []

    if (postCount >= 1 && !(await this.hasBadge(userId, BADGE_TYPES.FIRST_POST))) {
      badgesToAward.push(BADGE_TYPES.FIRST_POST)
    }
    if (postCount >= BADGE_THRESHOLDS.POST_COUNT.FIRST_TIER && !(await this.hasBadge(userId, BADGE_TYPES.POST_10))) {
      badgesToAward.push(BADGE_TYPES.POST_10)
    }
    if (postCount >= 50 && !(await this.hasBadge(userId, BADGE_TYPES.POST_50))) {
      badgesToAward.push(BADGE_TYPES.POST_50)
    }
    if (postCount >= BADGE_THRESHOLDS.POST_COUNT.SECOND_TIER && !(await this.hasBadge(userId, BADGE_TYPES.POST_100))) {
      badgesToAward.push(BADGE_TYPES.POST_100)
    }

    const awardedBadges = await Promise.all(
      badgesToAward.map(badgeType => this.awardBadge(userId, badgeType))
    )

    return awardedBadges.filter(badge => badge !== null) as UserBadge[]
  }

  // 댓글 작성 후 뱃지 체크
  async checkCommentBadges(userId: number): Promise<UserBadge[]> {
    const commentCount = await prisma.comment.count({
      where: { userId, isDeleted: false }
    })

    const badgesToAward: BadgeType[] = []

    if (commentCount >= 1 && !(await this.hasBadge(userId, BADGE_TYPES.FIRST_COMMENT))) {
      badgesToAward.push(BADGE_TYPES.FIRST_COMMENT)
    }
    if (commentCount >= BADGE_THRESHOLDS.COMMENT_COUNT.FIRST_TIER && !(await this.hasBadge(userId, BADGE_TYPES.COMMENT_10))) {
      badgesToAward.push(BADGE_TYPES.COMMENT_10)
    }
    if (commentCount >= 50 && !(await this.hasBadge(userId, BADGE_TYPES.COMMENT_50))) {
      badgesToAward.push(BADGE_TYPES.COMMENT_50)
    }
    if (commentCount >= BADGE_THRESHOLDS.COMMENT_COUNT.SECOND_TIER && !(await this.hasBadge(userId, BADGE_TYPES.COMMENT_100))) {
      badgesToAward.push(BADGE_TYPES.COMMENT_100)
    }

    const awardedBadges = await Promise.all(
      badgesToAward.map(badgeType => this.awardBadge(userId, badgeType))
    )

    return awardedBadges.filter(badge => badge !== null) as UserBadge[]
  }

  // 받은 좋아요 뱃지 체크
  async checkLikeBadges(userId: number): Promise<UserBadge[]> {
    const likeCount = await prisma.postLike.count({
      where: {
        post: { userId }
      }
    })

    const badgesToAward: BadgeType[] = []

    if (likeCount >= BADGE_THRESHOLDS.LIKE_RECEIVED.FIRST_TIER && !(await this.hasBadge(userId, BADGE_TYPES.LIKE_RECEIVED_10))) {
      badgesToAward.push(BADGE_TYPES.LIKE_RECEIVED_10)
    }
    if (likeCount >= 50 && !(await this.hasBadge(userId, BADGE_TYPES.LIKE_RECEIVED_50))) {
      badgesToAward.push(BADGE_TYPES.LIKE_RECEIVED_50)
    }
    if (likeCount >= BADGE_THRESHOLDS.LIKE_RECEIVED.SECOND_TIER && !(await this.hasBadge(userId, BADGE_TYPES.LIKE_RECEIVED_100))) {
      badgesToAward.push(BADGE_TYPES.LIKE_RECEIVED_100)
    }

    const awardedBadges = await Promise.all(
      badgesToAward.map(badgeType => this.awardBadge(userId, badgeType))
    )

    return awardedBadges.filter(badge => badge !== null) as UserBadge[]
  }

  // 레벨업 후 뱃지 체크
  async checkLevelBadges(userId: number, newLevel: number): Promise<UserBadge[]> {
    const badgesToAward: BadgeType[] = []

    if (newLevel >= 5 && !(await this.hasBadge(userId, BADGE_TYPES.LEVEL_5))) {
      badgesToAward.push(BADGE_TYPES.LEVEL_5)
    }
    if (newLevel >= BADGE_THRESHOLDS.LEVEL.FIRST_TIER && !(await this.hasBadge(userId, BADGE_TYPES.LEVEL_10))) {
      badgesToAward.push(BADGE_TYPES.LEVEL_10)
    }
    if (newLevel >= BADGE_THRESHOLDS.LEVEL.SECOND_TIER && !(await this.hasBadge(userId, BADGE_TYPES.LEVEL_15))) {
      badgesToAward.push(BADGE_TYPES.LEVEL_15)
    }
    if (newLevel >= 20 && !(await this.hasBadge(userId, BADGE_TYPES.LEVEL_20))) {
      badgesToAward.push(BADGE_TYPES.LEVEL_20)
    }

    const awardedBadges = await Promise.all(
      badgesToAward.map(badgeType => this.awardBadge(userId, badgeType))
    )

    return awardedBadges.filter(badge => badge !== null) as UserBadge[]
  }

  // 얼리 어답터 뱃지 체크 (회원가입 후 호출)
  async checkEarlyAdopterBadge(userId: number): Promise<UserBadge | null> {
    // 전체 회원 수가 100명 이하일 때만 부여
    const userCount = await prisma.user.count()
    if (userCount <= BADGE_THRESHOLDS.EARLY_ADOPTER.MAX_USERS) {
      return this.awardBadge(userId, BADGE_TYPES.EARLY_ADOPTER, { userNumber: userCount })
    }
    return null
  }

  // 연속 로그인 뱃지 체크
  async checkDailyLoginBadges(userId: number, consecutiveDays: number): Promise<UserBadge[]> {
    const badgesToAward: BadgeType[] = []

    if (consecutiveDays >= 7 && !(await this.hasBadge(userId, BADGE_TYPES.DAILY_LOGIN_7))) {
      badgesToAward.push(BADGE_TYPES.DAILY_LOGIN_7)
    }
    if (consecutiveDays >= BADGE_THRESHOLDS.DAILY_LOGIN.ACHIEVEMENT && !(await this.hasBadge(userId, BADGE_TYPES.DAILY_LOGIN_30))) {
      badgesToAward.push(BADGE_TYPES.DAILY_LOGIN_30)
    }

    const awardedBadges = await Promise.all(
      badgesToAward.map(badgeType => this.awardBadge(userId, badgeType))
    )

    return awardedBadges.filter(badge => badge !== null) as UserBadge[]
  }
}