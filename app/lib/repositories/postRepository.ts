import { prisma } from '@/lib/prisma'
import { Post, BoardType, Prisma } from '@prisma/client'
import { IRepository, PaginatedResult, PaginationParams } from './baseRepository'

export interface PostWithRelations extends Post {
  user: {
    id: number
    username: string
    level: number
  }
  category: {
    id: number
    name: string
    slug: string
  } | null
  _count: {
    comments: number
    likes: number
  }
}

export interface PostFilters {
  boardType?: BoardType
  categoryId?: number
  categorySlug?: string
  userId?: number
  isPinned?: boolean
  search?: string
}

export interface IPostRepository extends IRepository<Post> {
  findWithRelations(id: number): Promise<PostWithRelations | null>
  findByFilters(filters: PostFilters, params?: PaginationParams): Promise<PaginatedResult<PostWithRelations>>
  incrementViews(id: number): Promise<void>
  updateCounts(id: number): Promise<void>
}

export class PostRepository implements IPostRepository {
  async findById(id: number): Promise<Post | null> {
    return prisma.post.findFirst({
      where: { 
        id,
        isDeleted: false 
      }
    })
  }

  async findWithRelations(id: number): Promise<PostWithRelations | null> {
    return prisma.post.findFirst({
      where: { 
        id,
        isDeleted: false 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })
  }

  async findByFilters(
    filters: PostFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<PostWithRelations>> {
    const { page = 1, limit = 20, orderBy = 'createdAt', order = 'desc' } = params || {}
    const { boardType, categoryId, categorySlug, userId, isPinned, search } = filters

    const where: Prisma.PostWhereInput = {
      isDeleted: false,
      ...(boardType && { boardType }),
      ...(categoryId && { categoryId }),
      ...(userId && { userId }),
      ...(isPinned !== undefined && { isPinned }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // categorySlug로 필터링하는 경우
    if (categorySlug) {
      const category = await prisma.boardCategory.findUnique({
        where: { slug: categorySlug }
      })
      if (category) {
        where.categoryId = category.id
      }
    }

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          // 고정 게시글 우선
          { isPinned: 'desc' },
          // 그 다음 정렬 기준
          { [orderBy]: order }
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              level: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        }
      }),
      prisma.post.count({ where })
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

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20 } = params || {}
    
    const where = { isDeleted: false }
    
    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
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

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return prisma.post.create({ data })
  }

  async update(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<void> {
    // Soft delete
    await prisma.post.update({
      where: { id },
      data: { isDeleted: true }
    })
  }

  async incrementViews(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    })
  }
  
  async countByUser(userId: number): Promise<number> {
    return prisma.post.count({
      where: {
        userId,
        isDeleted: false
      }
    })
  }

  async updateCounts(id: number): Promise<void> {
    const counts = await prisma.post.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })

    if (counts) {
      await prisma.post.update({
        where: { id },
        data: {
          commentsCount: counts._count.comments,
          likesCount: counts._count.likes
        }
      })
    }
  }
}