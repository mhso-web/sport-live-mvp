import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminPostService, CommentFiltersDto } from '@/services/admin/adminPostService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUB_ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const searchParams = request.nextUrl.searchParams
    
    // 쿼리 파라미터 파싱
    const filters = CommentFiltersDto.parse({
      search: searchParams.get('search') || undefined,
      postId: searchParams.get('postId') ? parseInt(searchParams.get('postId')!) : undefined,
      authorId: searchParams.get('authorId') ? parseInt(searchParams.get('authorId')!) : undefined,
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    })

    const result = await AdminPostService.findManyComments(filters)
    return ApiResponse.success(result)
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error)
    return ApiResponse.error('댓글 목록 조회에 실패했습니다')
  }
}