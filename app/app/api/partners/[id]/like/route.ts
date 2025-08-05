import { NextRequest, NextResponse } from 'next/server'
import { partnerService } from '@/lib/services/partnerService'
import { ApiResponse } from '@/lib/utils/apiResponse'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// 좋아요 상태 확인
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return ApiResponse.success({ liked: false })
    }

    const partnerId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    const liked = await partnerService.checkUserLike(partnerId, userId)

    return ApiResponse.success({ liked })
  } catch (error) {
    console.error('Check like error:', error)
    return ApiResponse.error(error)
  }
}

// 좋아요 토글
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const partnerId = parseInt(params.id)

    const result = await partnerService.toggleLike(partnerId, request as any)

    return ApiResponse.success(
      result,
      result.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.'
    )
  } catch (error) {
    console.error('Toggle like error:', error)
    return ApiResponse.error(error)
  }
}