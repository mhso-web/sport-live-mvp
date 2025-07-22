import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        replies: []
      }
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