import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid post ID' },
        { status: 400 }
      )
    }

    // 조회수 증가
    const post = await prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      },
      include: {
        user: true
      }
    })
    
    // 조회수 마일스톤 체크 (게시글 작성자에게 경험치 부여)
    if (post.views === 100) {
      await ExperienceService.awardExperience(post.userId, 'POST_VIEWS_100', {
        postId: post.id,
        views: post.views
      })
    } else if (post.views === 1000) {
      await ExperienceService.awardExperience(post.userId, 'POST_VIEWS_1000', {
        postId: post.id,
        views: post.views
      })
    }

    return NextResponse.json({
      success: true,
      data: { views: post.views }
    })
  } catch (error: any) {
    console.error('Error incrementing view count:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}