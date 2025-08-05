import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminPostService } from '@/services/admin/adminPostService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUB_ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const categories = await AdminPostService.getCategories()
    return ApiResponse.success(categories)
  } catch (error) {
    console.error('카테고리 조회 오류:', error)
    return ApiResponse.error('카테고리 조회에 실패했습니다', 500)
  }
}