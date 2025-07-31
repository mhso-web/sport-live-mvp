import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { UnauthorizedException, NotFoundException } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      throw new UnauthorizedException()
    }

    const commentId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // Check if comment exists
      const comment = await tx.comment.findUnique({
        where: { id: commentId }
      })

      if (!comment) {
        throw new NotFoundException('댓글')
      }

      // Check if already liked
      const existingLike = await tx.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId
          }
        }
      })

      let liked: boolean
      let likesCount: number

      if (existingLike) {
        // Unlike - 좋아요 취소
        await tx.commentLike.delete({
          where: {
            id: existingLike.id
          }
        })

        // Update likes count
        const updatedComment = await tx.comment.update({
          where: { id: commentId },
          data: { likesCount: { decrement: 1 } }
        })

        liked = false
        likesCount = updatedComment.likesCount
      } else {
        // Like - 좋아요 추가
        await tx.commentLike.create({
          data: {
            commentId,
            userId
          }
        })

        // Update likes count
        const updatedComment = await tx.comment.update({
          where: { id: commentId },
          data: { likesCount: { increment: 1 } }
        })

        liked = true
        likesCount = updatedComment.likesCount

        // 경험치 부여 (트랜잭션 내에서 처리)
        // 좋아요를 누른 사람에게
        await ExperienceService.awardExperience(userId, 'COMMENT_LIKE', {
          commentId,
          authorId: comment.userId
        })
        
        // 좋아요를 받은 사람에게 (본인 댓글이 아닌 경우)
        if (comment.userId !== userId) {
          await ExperienceService.awardExperience(comment.userId, 'RECEIVED_LIKE', {
            commentId,
            likedByUserId: userId
          })
        }
      }

      return {
        liked,
        likesCount
      }
    })

    return ApiResponse.success({
      liked: result.liked,
      likesCount: result.likesCount
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
    const commentId = parseInt(params.id)

    if (!session?.user) {
      return ApiResponse.success({
        liked: false
      })
    }

    const userId = parseInt(session.user.id)

    const like = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
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