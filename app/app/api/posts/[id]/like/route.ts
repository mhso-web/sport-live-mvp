import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { PostRepository } from '@/lib/repositories/postRepository'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const postRepository = new PostRepository()

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

    const postId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Check if post exists
    const post = await postRepository.findById(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: {
          id: existingLike.id
        }
      })

      // Update likes count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      })

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likesCount: post.likesCount - 1
        }
      })
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userId
        }
      })

      // Update likes count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      })

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likesCount: post.likesCount + 1
        }
      })
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
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
    const postId = parseInt(params.id)

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: {
          liked: false
        }
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

    return NextResponse.json({
      success: true,
      data: {
        liked: !!like
      }
    })
  } catch (error) {
    console.error('Failed to get like status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}