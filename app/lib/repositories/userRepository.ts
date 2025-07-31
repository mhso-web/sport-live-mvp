import { prisma } from '@/lib/prisma'
import { User, Prisma } from '@prisma/client'

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  update(id: number, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: number): Promise<void>
  findProfileById(id: number): Promise<UserProfileData | null>
  getUserStats(userId: number): Promise<UserStats>
  getRecentPosts(userId: number, limit?: number): Promise<RecentPost[]>
  getRecentComments(userId: number, limit?: number): Promise<RecentComment[]>
  getPartnerActivities(userId: number): Promise<PartnerActivity[]>
}

export interface UserProfileData {
  id: number
  username: string
  email: string | null
  role: string
  level: number
  experience: number
  bio: string | null
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
}

export interface UserStats {
  postCount: number
  commentCount: number
  likeReceivedCount: number
  totalViews: number
}

export interface RecentPost {
  id: number
  title: string
  views: number
  likeCount: number
  commentCount: number
  createdAt: Date
  boardCategory: {
    id: number
    name: string
    slug: string
  } | null
}

export interface RecentComment {
  id: number
  content: string
  createdAt: Date
  post: {
    id: number
    title: string
  }
}

export interface PartnerActivity {
  partnerId: number
  partnerName: string
  hasLiked: boolean
  hasCommented: boolean
  hasRated: boolean
  rating?: number
  lastActivityAt: Date
}

export class UserRepository implements IUserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data })
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    })
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  }

  async updateLastLogin(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    })
  }

  async findProfileById(id: number): Promise<UserProfileData | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) return null

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      level: user.level,
      experience: user.experience,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const [postCount, commentCount, likeStats, viewStats] = await Promise.all([
      prisma.post.count({
        where: { userId, isDeleted: false }
      }),
      prisma.comment.count({
        where: { userId, isDeleted: false }
      }),
      prisma.postLike.count({
        where: { 
          post: { userId }
        }
      }),
      prisma.post.aggregate({
        where: { userId, isDeleted: false },
        _sum: { views: true }
      })
    ])

    return {
      postCount,
      commentCount,
      likeReceivedCount: likeStats,
      totalViews: viewStats._sum.views || 0
    }
  }

  async getRecentPosts(userId: number, limit: number = 5): Promise<RecentPost[]> {
    const posts = await prisma.post.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        title: true,
        views: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: { where: { isDeleted: false } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      views: post.views,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
      boardCategory: post.category
    }))
  }

  async getRecentComments(userId: number, limit: number = 5): Promise<RecentComment[]> {
    const comments = await prisma.comment.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return comments
  }

  async getPartnerActivities(userId: number): Promise<PartnerActivity[]> {
    // 모든 파트너 가져오기
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true
      }
    })

    // 각 파트너에 대한 활동 정보 조회
    const activities = await Promise.all(
      partners.map(async (partner) => {
        const [like, comment, rating] = await Promise.all([
          prisma.partnerLike.findUnique({
            where: {
              partnerId_userId: {
                partnerId: partner.id,
                userId
              }
            }
          }),
          prisma.partnerComment.findFirst({
            where: {
              partnerId: partner.id,
              userId,
              isDeleted: false
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.partnerRating.findUnique({
            where: {
              partnerId_userId: {
                partnerId: partner.id,
                userId
              }
            }
          })
        ])

        // 마지막 활동 시간 계산
        const activityDates = [
          like?.createdAt,
          comment?.createdAt,
          rating?.createdAt
        ].filter(Boolean) as Date[]

        const lastActivityAt = activityDates.length > 0
          ? new Date(Math.max(...activityDates.map(d => d.getTime())))
          : new Date(0)

        return {
          partnerId: partner.id,
          partnerName: partner.name,
          hasLiked: !!like,
          hasCommented: !!comment,
          hasRated: !!rating,
          rating: rating?.rating,
          lastActivityAt
        }
      })
    )

    // 활동이 있는 파트너만 필터링하고 최근 활동순으로 정렬
    return activities
      .filter(activity => activity.hasLiked || activity.hasCommented || activity.hasRated)
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
  }
}