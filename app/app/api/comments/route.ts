import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExperienceService } from '@/lib/services/experienceService'
import { BadgeService } from '@/lib/services/badgeService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { UnauthorizedException, BadRequestException } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
  parentId: z.number().int().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      throw new UnauthorizedException()
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const userId = parseInt(session.user.id)

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 부모 댓글이 있는 경우 확인
      if (validatedData.parentId) {
        const parentComment = await tx.comment.findUnique({
          where: { id: validatedData.parentId }
        })

        if (!parentComment || parentComment.postId !== validatedData.postId) {
          throw new BadRequestException('유효하지 않은 부모 댓글입니다')
        }
      }

      // 댓글 생성
      const comment = await tx.comment.create({
        data: {
          postId: validatedData.postId,
          userId,
          content: validatedData.content,
          parentId: validatedData.parentId
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

      // 게시글의 댓글 수 업데이트
      await tx.post.update({
        where: { id: validatedData.postId },
        data: {
          commentsCount: {
            increment: 1
          }
        }
      })

      // 경험치 부여 체크
      let experienceResult = null
      const hasReceivedExp = await ExperienceService.hasReceivedCommentExperience(userId, validatedData.postId)
      
      // 자기 게시글이 아니고, 해당 게시글에 처음 댓글을 다는 경우에만 경험치 부여
      const post = await tx.post.findUnique({
        where: { id: validatedData.postId },
        select: { userId: true }
      })
      
      if (!hasReceivedExp && post?.userId !== userId) {
        experienceResult = await ExperienceService.awardExperience(userId, 'COMMENT_CREATE', {
          commentId: comment.id,
          postId: validatedData.postId
        })
      }

      // 최신 사용자 정보 가져오기
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { level: true, experience: true }
      })

      return {
        comment: {
          ...comment,
          replies: []
        },
        userLevel: user?.level,
        userExperience: user?.experience,
        experienceGained: experienceResult?.experienceGained
      }
    })

    // 뱃지 체크 (트랜잭션 외부에서 처리 - 실패해도 댓글 작성은 유지)
    try {
      const badgeService = new BadgeService()
      await badgeService.checkCommentBadges(userId)
    } catch (error) {
      console.error('Error checking badges:', error)
    }

    // 프론트엔드 호환성을 위해 기존 응답 구조 유지
    return ApiResponse.success(result.comment, {
      userLevel: result.userLevel,
      userExperience: result.userExperience
    })
  } catch (error) {
    return ApiResponse.error(error)
  }
}