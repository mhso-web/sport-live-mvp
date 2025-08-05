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

// 댓글 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인 - ADMIN과 SUB_ADMIN만 삭제 가능
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const commentId = parseInt(params.id)
    await AdminPostService.deleteComment(commentId)
    
    return ApiResponse.success({ message: '댓글이 삭제되었습니다' })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return ApiResponse.error('댓글 삭제에 실패했습니다')
  }
}