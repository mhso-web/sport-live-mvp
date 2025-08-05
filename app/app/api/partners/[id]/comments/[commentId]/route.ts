import { NextRequest, NextResponse } from 'next/server'
import { partnerService } from '@/lib/services/partnerService'
import { ApiResponse } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
    commentId: string
  }
}

// 댓글 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const commentId = parseInt(params.commentId)

    await partnerService.deleteComment(commentId, request as any)

    return ApiResponse.success({ message: '댓글이 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return ApiResponse.error(error)
  }
}