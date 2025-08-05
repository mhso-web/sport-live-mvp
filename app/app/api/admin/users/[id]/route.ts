import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminUserService } from '@/services/admin/adminUserService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// 사용자 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const userId = parseInt(params.id)
    const user = await AdminUserService.findById(userId)
    
    return ApiResponse.success(user)
  } catch (error) {
    console.error('사용자 조회 오류:', error)
    return ApiResponse.error('사용자 조회에 실패했습니다')
  }
}