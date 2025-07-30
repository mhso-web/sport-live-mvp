import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExperienceService } from '@/lib/services/experienceService'

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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // 부모 댓글이 있는 경우 확인
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentComment || parentComment.postId !== validatedData.postId) {
        return NextResponse.json(
          { success: false, message: 'Invalid parent comment' },
          { status: 400 }
        )
      }
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        postId: validatedData.postId,
        userId: parseInt(session.user.id),
        content: validatedData.content,
        parentId: validatedData.parentId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            level: true
          }
        }
      }
    })

    // 게시글의 댓글 수 업데이트
    await prisma.post.update({
      where: { id: validatedData.postId },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    // 경험치 부여 (같은 게시글에 처음 댓글 작성시에만)
    const userId = parseInt(session.user.id)
    const hasReceivedExp = await ExperienceService.hasReceivedCommentExperience(userId, validatedData.postId)
    
    // 자기 게시글이 아니고, 해당 게시글에 처음 댓글을 다는 경우에만 경험치 부여
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { userId: true }
    })
    
    if (!hasReceivedExp && post?.userId !== userId) {
      await ExperienceService.awardExperience(userId, 'COMMENT_CREATE', {
        commentId: comment.id,
        postId: validatedData.postId
      })
    }

    // 최신 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { level: true, experience: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        replies: []
      },
      userLevel: user?.level || session.user.level,
      userExperience: user?.experience || session.user.experience
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create comment' },
      { status: 500 }
    )
  }
}