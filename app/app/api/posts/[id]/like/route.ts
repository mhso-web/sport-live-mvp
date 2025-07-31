import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { PostRepository } from '@/lib/repositories/postRepository'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'
import { BadgeService } from '@/lib/services/badgeService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { UnauthorizedException, NotFoundException, BadRequestException } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const postRepository = new PostRepository()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      throw new UnauthorizedException()
    }

    const postId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Check if post exists
    const post = await postRepository.findById(postId)
    if (!post) {
      throw new NotFoundException('게시글')
    }

    // Check if it's own post
    if (post.userId === userId) {
      throw new BadRequestException('자신의 게시글에는 좋아요를 할 수 없습니다')
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // Check if already liked
      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      })

      let liked: boolean
      let likesCount: number
      let experienceResult = null

      if (existingLike) {
        // Unlike - 좋아요 취소
        await tx.postLike.delete({
          where: {
            id: existingLike.id
          }
        })

        // Update likes count
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })

        liked = false
        likesCount = updatedPost.likesCount
      } else {
        // Like - 좋아요 추가
        await tx.postLike.create({
          data: {
            postId,
            userId
          }
        })

        // Update likes count
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })

        liked = true
        likesCount = updatedPost.likesCount

        // 경험치 부여 (트랜잭션 내에서 처리)
        // 좋아요를 누른 사람에게
        const likerExpResult = await ExperienceService.awardExperience(userId, 'POST_LIKE', {
          postId,
          authorId: post.userId
        })
        
        // 좋아요를 받은 사람에게
        if (post.userId !== userId) {
          await ExperienceService.awardExperience(post.userId, 'RECEIVED_LIKE', {
            postId,
            likedByUserId: userId
          })
        }

        experienceResult = likerExpResult
      }

      // 최신 사용자 정보 가져오기 (트랜잭션 내에서)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { level: true, experience: true }
      })

      return {
        liked,
        likesCount,
        userLevel: user?.level,
        userExperience: user?.experience,
        experienceGained: experienceResult?.experienceGained
      }
    })

    // 뱃지 체크 (트랜잭션 외부에서 처리 - 실패해도 좋아요는 유지)
    if (result.liked && post.userId !== userId) {
      try {
        const badgeService = new BadgeService()
        await badgeService.checkLikeBadges(post.userId)
      } catch (error) {
        console.error('Error checking badges:', error)
      }
    }

    // 프론트엔드 호환성을 위해 기존 응답 구조 유지
    return ApiResponse.success({
      liked: result.liked,
      likesCount: result.likesCount
    }, {
      userLevel: result.userLevel,
      userExperience: result.userExperience
    })
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const postId = parseInt(params.id)

    if (!session?.user) {
      return ApiResponse.success({
        liked: false
      })
    }

    const userId = parseInt(session.user.id)

    const like = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    return ApiResponse.success({
      liked: !!like
    })
  } catch (error) {
    return ApiResponse.error(error)
  }
}