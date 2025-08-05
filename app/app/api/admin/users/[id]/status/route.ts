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

// 사용자 상태 토글
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const userId = parseInt(params.id)
    const adminId = parseInt(session.user.id)
    
    const updatedUser = await AdminUserService.toggleStatus(userId, adminId)
    
    return ApiResponse.success({
      id: updatedUser.id,
      isActive: updatedUser.isActive
    })
  } catch (error: any) {
    console.error('사용자 상태 변경 오류:', error)
    return ApiResponse.error(error.message || '상태 변경에 실패했습니다')
  }
}