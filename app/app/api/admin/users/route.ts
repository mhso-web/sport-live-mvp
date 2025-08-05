import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminUserService, UserFiltersDto } from '@/services/admin/adminUserService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인 - ADMIN만 사용자 목록 조회 가능
    if (!session?.user || session.user.role !== 'ADMIN') {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const searchParams = request.nextUrl.searchParams
    
    // 쿼리 파라미터 파싱
    const filters = UserFiltersDto.parse({
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
      levelMin: searchParams.get('levelMin') ? parseInt(searchParams.get('levelMin')!) : undefined,
      levelMax: searchParams.get('levelMax') ? parseInt(searchParams.get('levelMax')!) : undefined,
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    })

    const result = await AdminUserService.findMany(filters)
    return ApiResponse.success(result)
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    return ApiResponse.error('사용자 목록 조회에 실패했습니다')
  }
}