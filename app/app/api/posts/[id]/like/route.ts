import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { PostRepository } from '@/lib/repositories/postRepository'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'

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

    // Check if it's own post
    if (post.userId === userId) {
      return NextResponse.json(
        { success: false, error: '자신의 게시글에는 좋아요를 할 수 없습니다' },
        { status: 400 }
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

      // 경험치 부여
      // 좋아요를 누른 사람에게
      await ExperienceService.awardExperience(userId, 'POST_LIKE', {
        postId,
        authorId: post.userId
      })
      
      // 좋아요를 받은 사람에게 (본인 게시글이 아닌 경우)
      if (post.userId !== userId) {
        await ExperienceService.awardExperience(post.userId, 'RECEIVED_LIKE', {
          postId,
          likedByUserId: userId
        })
      }

      // 최신 사용자 정보 가져오기
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, experience: true }
      })

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likesCount: post.likesCount + 1
        },
        userLevel: user?.level,
        userExperience: user?.experience
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