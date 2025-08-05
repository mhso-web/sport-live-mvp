import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminPostService } from '@/services/admin/adminPostService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// 게시글 숨기기/보이기 토글
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUB_ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const postId = parseInt(params.id)
    const updatedPost = await AdminPostService.togglePostVisibility(postId)
    
    return ApiResponse.success({
      id: updatedPost.id,
      isDeleted: updatedPost.isDeleted
    })
  } catch (error: any) {
    console.error('게시글 가시성 변경 오류:', error)
    return ApiResponse.error(error.message || '가시성 변경에 실패했습니다')
  }
}