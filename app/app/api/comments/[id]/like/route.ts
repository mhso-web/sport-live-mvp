import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const commentId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id
        }
      })

      // Update likes count
      await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } }
      })

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likesCount: comment.likesCount - 1
        }
      })
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId
        }
      })

      // Update likes count
      await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } }
      })

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likesCount: comment.likesCount + 1
        }
      })
    }
  } catch (error) {
    console.error('Failed to toggle comment like:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({
        success: true,
        data: {
          liked: false
        }
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

    return NextResponse.json({
      success: true,
      data: {
        liked: !!like
      }
    })
  } catch (error) {
    console.error('Failed to get comment like status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}