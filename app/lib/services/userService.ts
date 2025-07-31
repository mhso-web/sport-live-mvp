import { UserRepository } from '@/lib/repositories/userRepository'
import { ExperienceService } from '@/lib/services/experienceService'
import { BadgeService } from '@/lib/services/badgeService'
import type { UserProfileData, UserStats, RecentPost, RecentComment, PartnerActivity } from '@/lib/repositories/userRepository'
import type { UserBadge } from '@prisma/client'
import { UpdateProfileDto, ChangePasswordDto } from '@/lib/dto/user/updateProfile.dto'
import bcrypt from 'bcryptjs'
import { ForbiddenException, BadRequestException } from '@/lib/errors'

export interface UserProfile {
  user: UserProfileData
  stats: UserStats
  recentPosts: RecentPost[]
  recentComments: RecentComment[]
  levelProgress: {
    currentLevel: number
    currentExperience: number
    experienceForNextLevel: number
    progressPercentage: number
  }
  badges: UserBadge[]
  partnerActivities: PartnerActivity[]
}

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private experienceService: ExperienceService
  ) {}

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const user = await this.userRepository.findProfileById(userId)
    
    if (!user) {
      return null
    }

    const badgeService = new BadgeService()
    const [stats, recentPosts, recentComments, badges, partnerActivities] = await Promise.all([
      this.userRepository.getUserStats(userId),
      this.userRepository.getRecentPosts(userId, 5),
      this.userRepository.getRecentComments(userId, 5),
      badgeService.getUserBadges(userId),
      this.userRepository.getPartnerActivities(userId)
    ])

    const currentLevelExp = user.level === 1 ? 0 : ExperienceService.getExperienceForNextLevel(user.level - 1)
    const nextLevelExp = ExperienceService.getExperienceForNextLevel(user.level)
    const progressPercentage = ExperienceService.calculateLevelProgress(user.experience, user.level)
    
    const levelProgress = {
      currentLevel: user.level,
      currentExperience: user.experience,
      experienceForNextLevel: nextLevelExp,
      progressPercentage
    }

    return {
      user,
      stats,
      recentPosts,
      recentComments,
      levelProgress,
      badges,
      partnerActivities
    }
  }

  async getUserById(id: number) {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email)
  }

  async getUserByUsername(username: string) {
    return this.userRepository.findByUsername(username)
  }

  async updateProfile(userId: number, data: UpdateProfileDto, currentUserId: number) {
    // 권한 확인 - 본인만 수정 가능
    if (userId !== currentUserId) {
      throw new ForbiddenException('다른 사용자의 프로필을 수정할 수 없습니다')
    }

    // username 중복 체크
    if (data.username) {
      const existingUser = await this.userRepository.findByUsername(data.username)
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('이미 사용 중인 닉네임입니다')
      }
    }

    return this.userRepository.update(userId, data)
  }

  async changePassword(userId: number, data: ChangePasswordDto, currentUserId: number) {
    // 권한 확인 - 본인만 변경 가능
    if (userId !== currentUserId) {
      throw new ForbiddenException('다른 사용자의 비밀번호를 변경할 수 없습니다')
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다')
    }

    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!isValidPassword) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다')
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    
    return this.userRepository.update(userId, { passwordHash: hashedPassword })
  }
}