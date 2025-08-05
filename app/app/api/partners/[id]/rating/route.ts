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

// 사용자의 평점 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return ApiResponse.error('로그인이 필요합니다.', 401)
    }

    const partnerId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    const rating = await partnerService.getUserRating(partnerId, userId)

    return ApiResponse.success({
      rating: rating?.rating || 0,
      comment: rating?.comment || '',
      hasRated: !!rating
    })
  } catch (error) {
    console.error('Get rating error:', error)
    return ApiResponse.error(error)
  }
}

// 평점 생성/수정
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const partnerId = parseInt(params.id)
    const data = await request.json()

    const rating = await partnerService.createOrUpdateRating(
      partnerId,
      data,
      request as any
    )

    return ApiResponse.success(rating, '평점이 등록되었습니다.')
  } catch (error) {
    console.error('Create rating error:', error)
    return ApiResponse.error(error)
  }
}