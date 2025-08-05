import { Partner, PartnerRating, PartnerComment, PartnerLike } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { AuthService } from '@/lib/services/authService'
import { ExperienceService } from '@/lib/services/experienceService'
import { ValidationError, UnauthorizedException, NotFoundError } from '@/lib/errors'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

export interface CreateRatingDto {
  rating: number
  comment?: string
}

export interface CreateCommentDto {
  content: string
}

export class PartnerService {
  constructor(
    private partnerRepository: PartnerRepository,
    private authService: AuthService,
    private experienceService: ExperienceService
  ) {}

  // 별점 평가 추가/수정
  async createOrUpdateRating(
    partnerId: number,
    data: CreateRatingDto,
    request: Request
  ): Promise<PartnerRating> {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedException('로그인이 필요합니다.')
    }

    // 유효성 검사
    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError('평점은 1점에서 5점 사이여야 합니다.')
    }

    // 파트너 존재 확인
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner || !partner.isActive) {
      throw new NotFoundError('보증업체를 찾을 수 없습니다.')
    }

    const userId = parseInt(session.user.id)

    // 기존 평점 확인
    const existingRating = await prisma.partnerRating.findUnique({
      where: {
        partnerId_userId: {
          partnerId,
          userId
        }
      }
    })

    let rating: PartnerRating

    if (existingRating) {
      // 기존 평점 수정
      rating = await prisma.partnerRating.update({
        where: { id: existingRating.id },
        data: {
          rating: data.rating,
          comment: data.comment,
          updatedAt: new Date()
        }
      })
    } else {
      // 새 평점 생성
      rating = await prisma.partnerRating.create({
        data: {
          partnerId,
          userId,
          rating: data.rating,
          comment: data.comment
        }
      })

      // 첫 평점 작성시 경험치 부여
      await this.experienceService.awardExperience(
        userId,
        'PARTNER_RATING',
        3,
        `${partner.name} 평가`
      )
    }

    return rating
  }

  // 사용자의 평점 조회
  async getUserRating(partnerId: number, userId: number): Promise<PartnerRating | null> {
    return prisma.partnerRating.findUnique({
      where: {
        partnerId_userId: {
          partnerId,
          userId
        }
      }
    })
  }

  // 댓글 작성
  async createComment(
    partnerId: number,
    data: CreateCommentDto,
    request: Request
  ): Promise<PartnerComment> {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedException('로그인이 필요합니다.')
    }

    // 유효성 검사
    if (!data.content || data.content.trim().length < 10) {
      throw new ValidationError('댓글은 10자 이상 작성해주세요.')
    }

    if (data.content.length > 500) {
      throw new ValidationError('댓글은 500자 이내로 작성해주세요.')
    }

    // 파트너 존재 확인
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner || !partner.isActive) {
      throw new NotFoundError('보증업체를 찾을 수 없습니다.')
    }

    const userId = parseInt(session.user.id)

    // 댓글 생성
    const comment = await prisma.partnerComment.create({
      data: {
        partnerId,
        userId,
        content: data.content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true
          }
        }
      }
    })

    // 댓글 작성 경험치 부여
    await this.experienceService.awardExperience(
      userId,
      'PARTNER_COMMENT',
      5,
      `${partner.name} 댓글 작성`
    )

    return comment
  }

  // 댓글 삭제
  async deleteComment(commentId: number, request: Request): Promise<void> {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedException('로그인이 필요합니다.')
    }

    const userId = parseInt(session.user.id)

    // 댓글 존재 및 권한 확인
    const comment = await prisma.partnerComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.')
    }

    // 본인 댓글이거나 관리자인 경우만 삭제 가능
    const isOwner = comment.userId === userId
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUB_ADMIN'

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('댓글을 삭제할 권한이 없습니다.')
    }

    // 소프트 삭제
    await prisma.partnerComment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    })
  }

  // 좋아요 토글
  async toggleLike(partnerId: number, request: Request): Promise<{ liked: boolean; likeCount: number }> {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedException('로그인이 필요합니다.')
    }

    // 파트너 존재 확인
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner || !partner.isActive) {
      throw new NotFoundError('보증업체를 찾을 수 없습니다.')
    }

    const userId = parseInt(session.user.id)

    // 기존 좋아요 확인
    const existingLike = await prisma.partnerLike.findUnique({
      where: {
        partnerId_userId: {
          partnerId,
          userId
        }
      }
    })

    let liked: boolean

    if (existingLike) {
      // 좋아요 취소
      await prisma.partnerLike.delete({
        where: { id: existingLike.id }
      })
      liked = false
    } else {
      // 좋아요 추가
      await prisma.partnerLike.create({
        data: {
          partnerId,
          userId
        }
      })
      liked = true

      // 좋아요 경험치 부여
      await this.experienceService.awardExperience(
        userId,
        'PARTNER_LIKE',
        1,
        `${partner.name} 좋아요`
      )
    }

    // 전체 좋아요 수 조회
    const likeCount = await prisma.partnerLike.count({
      where: { partnerId }
    })

    return { liked, likeCount }
  }

  // 사용자가 좋아요 했는지 확인
  async checkUserLike(partnerId: number, userId: number): Promise<boolean> {
    const like = await prisma.partnerLike.findUnique({
      where: {
        partnerId_userId: {
          partnerId,
          userId
        }
      }
    })
    return !!like
  }
}

// 싱글톤 인스턴스 생성
export const partnerService = new PartnerService(
  new PartnerRepository(),
  new AuthService(),
  new ExperienceService()
)