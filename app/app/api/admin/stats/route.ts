import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminStatsService } from '@/services/admin/adminStatsService'
import { ApiResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return ApiResponse.error('권한이 없습니다', 403)
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    switch (type) {
      case 'dashboard':
        const stats = await AdminStatsService.getDashboardStats()
        return ApiResponse.success(stats)
        
      case 'recent-users':
        const limit = parseInt(searchParams.get('limit') || '5')
        const users = await AdminStatsService.getRecentUsers(limit)
        return ApiResponse.success(users)
        
      case 'recent-posts':
        const postLimit = parseInt(searchParams.get('limit') || '5')
        const posts = await AdminStatsService.getRecentPosts(postLimit)
        return ApiResponse.success(posts)
        
      case 'daily-stats':
        const days = parseInt(searchParams.get('days') || '7')
        const dailyStats = await AdminStatsService.getDailyStats(days)
        return ApiResponse.success(dailyStats)
        
      default:
        return ApiResponse.error('잘못된 요청입니다', 400)
    }
  } catch (error) {
    console.error('관리자 통계 조회 오류:', error)
    return ApiResponse.error('통계 조회에 실패했습니다')
  }
}