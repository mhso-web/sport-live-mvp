import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Role } from '@prisma/client'

// 사용자 필터 DTO
export const UserFiltersDto = z.object({
  search: z.string().optional(),
  role: z.enum(['ALL', 'USER', 'ANALYST', 'MODERATOR', 'SUB_ADMIN', 'ADMIN']).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE']).optional(),
  levelMin: z.number().optional(),
  levelMax: z.number().optional(),
  orderBy: z.enum(['createdAt', 'username', 'level', 'lastLoginAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  limit: z.number().default(20)
})

export type UserFilters = z.infer<typeof UserFiltersDto>

// 권한 변경 DTO
export const UpdateUserRoleDto = z.object({
  role: z.enum(['USER', 'ANALYST', 'MODERATOR', 'SUB_ADMIN', 'ADMIN'])
})

export interface AdminUser {
  id: number
  email: string
  username: string
  role: string
  level: number
  experience: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  bio: string | null
  _count: {
    posts: number
    comments: number
  }
}

export class AdminUserService {
  /**
   * 사용자 목록 조회
   */
  static async findMany(filters: UserFilters) {
    const { search, role, status, levelMin, levelMax, orderBy, order, page, limit } = filters
    const offset = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}

    // 검색어 처리
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 권한 필터
    if (role && role !== 'ALL') {
      where.role = role
    }

    // 상태 필터
    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE'
    }

    // 레벨 필터
    if (levelMin !== undefined || levelMax !== undefined) {
      where.level = {}
      if (levelMin !== undefined) where.level.gte = levelMin
      if (levelMax !== undefined) where.level.lte = levelMax
    }

    // 정렬 옵션
    const orderByClause: any = {}
    orderByClause[orderBy] = order

    // 데이터 조회
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: orderByClause,
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          level: true,
          experience: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          bio: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 사용자 상세 조회
   */
  static async findById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            postLikes: true,
            badges: true
          }
        },
        badges: {
          orderBy: { earnedAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다')
    }

    // 최근 활동 통계
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [recentPosts, recentComments, totalViews] = await Promise.all([
      prisma.post.count({
        where: {
          userId: userId,
          createdAt: { gte: lastMonth }
        }
      }),
      prisma.comment.count({
        where: {
          userId: userId,
          createdAt: { gte: lastMonth }
        }
      }),
      prisma.post.aggregate({
        where: { userId: userId },
        _sum: { views: true }
      })
    ])

    return {
      ...user,
      stats: {
        recentPosts,
        recentComments,
        totalViews: totalViews._sum.views || 0
      }
    }
  }

  /**
   * 사용자 상태 토글
   */
  static async toggleStatus(userId: number, adminId: number) {
    // 자기 자신의 상태는 변경할 수 없음
    if (userId === adminId) {
      throw new Error('자신의 상태는 변경할 수 없습니다')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다')
    }

    // 최고 관리자의 상태는 변경할 수 없음
    if (user.role === 'ADMIN') {
      throw new Error('최고 관리자의 상태는 변경할 수 없습니다')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    })

    return updatedUser
  }

  /**
   * 사용자 권한 변경
   */
  static async updateRole(userId: number, newRole: Role, adminId: number) {
    // 자기 자신의 권한은 변경할 수 없음
    if (userId === adminId) {
      throw new Error('자신의 권한은 변경할 수 없습니다')
    }

    const [user, admin] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: adminId } })
    ])

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다')
    }

    if (!admin) {
      throw new Error('관리자 정보를 찾을 수 없습니다')
    }

    // 권한 변경 규칙
    // 1. ADMIN만 다른 사용자를 ADMIN이나 SUB_ADMIN으로 변경 가능
    // 2. SUB_ADMIN은 일반 사용자의 권한만 변경 가능
    if (admin.role === 'SUB_ADMIN') {
      if (user.role !== 'USER' || ['ADMIN', 'SUB_ADMIN'].includes(newRole)) {
        throw new Error('권한이 없습니다')
      }
    }

    // 기존 ADMIN의 권한은 변경할 수 없음
    if (user.role === 'ADMIN') {
      throw new Error('최고 관리자의 권한은 변경할 수 없습니다')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    return updatedUser
  }

  /**
   * 사용자 통계
   */
  static async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      todayNewUsers,
      roleStats,
      levelDistribution
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.user.groupBy({
        by: ['level'],
        _count: true,
        orderBy: { level: 'asc' }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      todayNewUsers,
      roleStats: roleStats.reduce((acc: any, item) => {
        acc[item.role] = item._count
        return acc
      }, {}),
      levelDistribution
    }
  }
}