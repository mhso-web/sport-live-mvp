import { Partner, PartnerRating, PartnerComment, PartnerLike, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { IRepository, PaginationParams, PaginatedResult } from './baseRepository'

export interface PartnerWithRelations extends Partner {
  ratings: PartnerRating[]
  comments: PartnerComment[]
  likes: PartnerLike[]
  _count: {
    ratings: number
    comments: number
    likes: number
  }
  avgRating?: number
  totalRatings?: number
  totalComments?: number
  totalLikes?: number
}

export interface PartnerFilters {
  isActive?: boolean
  search?: string
  sortBy?: 'latest' | 'rating' | 'popular'
}

export class PartnerRepository implements IRepository<Partner> {
  async findById(id: number): Promise<Partner | null> {
    return prisma.partner.findUnique({
      where: { id }
    })
  }

  async findWithRelations(id: number): Promise<PartnerWithRelations | null> {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        ratings: true,
        comments: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, username: true, profileImage: true, level: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        likes: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        _count: {
          select: {
            ratings: true,
            comments: { where: { isDeleted: false } },
            likes: true
          }
        }
      }
    })

    if (!partner) return null

    // 평균 평점 계산
    const avgRating = partner.ratings.length > 0
      ? partner.ratings.reduce((sum, r) => sum + r.rating, 0) / partner.ratings.length
      : 0

    return {
      ...partner,
      avgRating
    }
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Partner>> {
    const { page = 1, limit = 20, orderBy = 'createdAt', orderDir = 'desc' } = params || {}
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.partner.findMany({
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDir }
      }),
      prisma.partner.count()
    ])

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }

  async findByFilters(
    filters: PartnerFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<PartnerWithRelations>> {
    const { page = 1, limit = 20 } = params || {}
    const skip = (page - 1) * limit

    const where: Prisma.PartnerWhereInput = {}

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    // 기본 쿼리로 데이터 가져오기
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        include: {
          ratings: true,
          _count: {
            select: {
              ratings: true,
              comments: { where: { isDeleted: false } },
              likes: true
            }
          }
        }
      }),
      prisma.partner.count({ where })
    ])

    // 평균 평점 계산 및 정렬
    let partnersWithRating = partners.map(partner => ({
      ...partner,
      avgRating: partner.ratings.length > 0
        ? partner.ratings.reduce((sum, r) => sum + r.rating, 0) / partner.ratings.length
        : 0,
      comments: [],
      likes: []
    }))

    // 정렬 적용
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          partnersWithRating.sort((a, b) => b.avgRating - a.avgRating)
          break
        case 'popular':
          partnersWithRating.sort((a, b) => b._count.likes - a._count.likes)
          break
        default:
          partnersWithRating.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    }

    return {
      data: partnersWithRating,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }

  async create(data: Prisma.PartnerCreateInput): Promise<Partner> {
    return prisma.partner.create({ data })
  }

  async update(id: number, data: Prisma.PartnerUpdateInput): Promise<Partner> {
    return prisma.partner.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<Partner> {
    return prisma.partner.update({
      where: { id },
      data: { isActive: false }
    })
  }

  async incrementViews(id: number): Promise<void> {
    await prisma.partner.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })
  }

  async findAllWithStats(
    orderBy?: Prisma.PartnerOrderByWithRelationInput,
    limit: number = 10,
    offset: number = 0
  ): Promise<PartnerWithRelations[]> {
    const partners = await prisma.partner.findMany({
      skip: offset,
      take: limit,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        ratings: true,
        _count: {
          select: {
            ratings: true,
            comments: { where: { isDeleted: false } },
            likes: true
          }
        }
      }
    })

    return partners.map(partner => ({
      ...partner,
      avgRating: partner.ratings.length > 0
        ? partner.ratings.reduce((sum, r) => sum + r.rating, 0) / partner.ratings.length
        : 0,
      comments: [],
      likes: [],
      totalRatings: partner._count.ratings,
      totalComments: partner._count.comments,
      totalLikes: partner._count.likes
    }))
  }

  async count(): Promise<number> {
    return prisma.partner.count()
  }
}