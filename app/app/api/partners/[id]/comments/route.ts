import { NextRequest, NextResponse } from 'next/server'
import { partnerService } from '@/lib/services/partnerService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// 댓글 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const partnerId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      prisma.partnerComment.findMany({
        where: {
          partnerId,
          isDeleted: false
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              level: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.partnerComment.count({
        where: {
          partnerId,
          isDeleted: false
        }
      })
    ])

    return ApiResponse.success({
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return ApiResponse.error(error)
  }
}

// 댓글 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const partnerId = parseInt(params.id)
    const data = await request.json()

    const comment = await partnerService.createComment(
      partnerId,
      data,
      request as any
    )

    return ApiResponse.success({ 
      comment,
      message: '댓글이 작성되었습니다.'
    })
  } catch (error) {
    console.error('Create comment error:', error)
    return ApiResponse.error(error)
  }
}