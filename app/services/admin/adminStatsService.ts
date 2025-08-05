import { prisma } from '@/lib/prisma'

export interface DashboardStats {
  users: {
    total: number
    todayNew: number
    activeCount: number
  }
  posts: {
    total: number
    todayNew: number
    pendingReports: number
  }
  partners: {
    total: number
    activeCount: number
    avgRating: number
  }
  activities: {
    todayLogins: number
    todayComments: number
    todayLikes: number
  }
}

export interface RecentUser {
  id: number
  email: string
  username: string
  role: string
  createdAt: Date
  level: number
}

export interface RecentPost {
  id: number
  title: string
  authorNickname: string
  categoryName: string
  createdAt: Date
  viewCount: number
}

export interface DailyStats {
  date: string
  users: number
  posts: number
  comments: number
}

export class AdminStatsService {
  /**
   * 대시보드 통계 가져오기
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 병렬로 모든 통계 조회
    const [
      totalUsers,
      todayUsers,
      activeUsers,
      totalPosts,
      todayPosts,
      totalPartners,
      activePartners,
      avgRating,
      todayLogins,
      todayComments,
      todayLikes
    ] = await Promise.all([
      // 사용자 통계
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // 게시글 통계
      prisma.post.count(),
      prisma.post.count({
        where: { createdAt: { gte: today } }
      }),
      
      // 보증업체 통계
      prisma.partner.count(),
      prisma.partner.count({
        where: { isActive: true }
      }),
      prisma.partnerRating.aggregate({
        _avg: { rating: true }
      }),
      
      // 오늘 활동 통계
      prisma.userExperienceLog.count({
        where: {
          createdAt: { gte: today },
          actionType: 'daily_login'
        }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.postLike.count({
        where: { createdAt: { gte: today } }
      })
    ])

    return {
      users: {
        total: totalUsers,
        todayNew: todayUsers,
        activeCount: activeUsers
      },
      posts: {
        total: totalPosts,
        todayNew: todayPosts,
        pendingReports: 0 // 신고 기능 구현 후 추가
      },
      partners: {
        total: totalPartners,
        activeCount: activePartners,
        avgRating: avgRating._avg.rating || 0
      },
      activities: {
        todayLogins,
        todayComments,
        todayLikes
      }
    }
  }

  /**
   * 최근 가입 회원 목록
   */
  static async getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        level: true
      }
    })

    return users
  }

  /**
   * 최근 게시글 목록
   */
  static async getRecentPosts(limit: number = 5): Promise<RecentPost[]> {
    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        views: true,
        user: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        }
      }
    })

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      authorNickname: post.user.username,
      categoryName: post.category?.name || '',
      createdAt: post.createdAt,
      viewCount: post.views
    }))
  }

  /**
   * 일별 통계 (차트용)
   */
  static async getDailyStats(days: number = 7): Promise<DailyStats[]> {
    const stats: DailyStats[] = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [users, posts, comments] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.post.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ])

      stats.push({
        date: date.toISOString().split('T')[0],
        users,
        posts,
        comments
      })
    }

    return stats
  }
}