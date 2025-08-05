import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { BadRequestException, NotFoundException } from '@/lib/errors'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      throw new BadRequestException('잘못된 게시글 ID입니다')
    }

    // 현재 사용자 정보 가져오기
    const session = await getServerSession(authOptions)
    const userId = session?.user ? parseInt(session.user.id) : null

    // 먼저 게시글 정보를 가져옴
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { 
        userId: true, 
        views: true,
        isDeleted: true
      }
    })

    if (!existingPost || existingPost.isDeleted) {
      throw new NotFoundException('게시글')
    }

    // 본인이 작성한 글인 경우 조회수를 증가시키지 않음
    if (userId && existingPost.userId === userId) {
      return ApiResponse.success({ 
        views: existingPost.views,
        isOwnPost: true 
      })
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

    return ApiResponse.success({ 
      views: post.views,
      isOwnPost: false 
    })
  } catch (error: any) {
    // Prisma P2025 에러는 레코드를 찾을 수 없을 때 발생
    if (error.code === 'P2025') {
      return ApiResponse.error(new NotFoundException('게시글'))
    }

    return ApiResponse.error(error)
  }
}