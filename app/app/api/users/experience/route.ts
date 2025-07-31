import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { EXPERIENCE_ACTION_DESCRIPTIONS } from '@/lib/constants/experience'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const userId = parseInt(session.user.id)

    // 전체 로그 수
    const total = await prisma.userExperienceLog.count({
      where: { userId }
    })

    // 경험치 로그 조회
    const logs = await prisma.userExperienceLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // 통계 데이터 조회
    const stats = await prisma.userExperienceLog.groupBy({
      by: ['actionType'],
      where: { userId },
      _count: true,
      _sum: {
        experienceGained: true
      }
    })

    // 일별 경험치 합계 (최근 30일)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyExp = await prisma.userExperienceLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        experienceGained: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // 일별로 그룹화
    const dailyData = dailyExp.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += log.experienceGained
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          ...log,
          description: log.description || EXPERIENCE_ACTION_DESCRIPTIONS[log.actionType as keyof typeof EXPERIENCE_ACTION_DESCRIPTIONS] || log.actionType
        })),
        stats: stats.map(stat => ({
          actionType: stat.actionType,
          count: stat._count,
          totalExp: stat._sum.experienceGained || 0
        })),
        dailyData: Object.entries(dailyData).map(([date, exp]) => ({
          date,
          exp
        }))
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch experience logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}