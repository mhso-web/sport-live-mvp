import { prisma } from '@/lib/prisma'
import { BoardCategory, BoardType, Prisma } from '@prisma/client'
import { IRepository, PaginatedResult, PaginationParams } from './baseRepository'

export interface IBoardCategoryRepository extends IRepository<BoardCategory> {
  findBySlug(slug: string): Promise<BoardCategory | null>
  findByBoardType(boardType: BoardType): Promise<BoardCategory[]>
  findActive(): Promise<BoardCategory[]>
}

export class BoardCategoryRepository implements IBoardCategoryRepository {
  async findById(id: number): Promise<BoardCategory | null> {
    return prisma.boardCategory.findUnique({
      where: { id }
    })
  }

  async findBySlug(slug: string): Promise<BoardCategory | null> {
    return prisma.boardCategory.findUnique({
      where: { slug }
    })
  }

  async findByBoardType(boardType: BoardType): Promise<BoardCategory[]> {
    return prisma.boardCategory.findMany({
      where: { 
        boardType,
        isActive: true 
      },
      orderBy: { orderIndex: 'asc' }
    })
  }

  async findActive(): Promise<BoardCategory[]> {
    return prisma.boardCategory.findMany({
      where: { isActive: true },
      orderBy: [
        { boardType: 'asc' },
        { orderIndex: 'asc' }
      ]
    })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<BoardCategory>> {
    const { page = 1, limit = 20 } = params || {}
    
    const [data, total] = await Promise.all([
      prisma.boardCategory.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { boardType: 'asc' },
          { orderIndex: 'asc' }
        ]
      }),
      prisma.boardCategory.count()
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

  async create(data: Prisma.BoardCategoryCreateInput): Promise<BoardCategory> {
    return prisma.boardCategory.create({ data })
  }

  async update(id: number, data: Prisma.BoardCategoryUpdateInput): Promise<BoardCategory> {
    return prisma.boardCategory.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.boardCategory.delete({
      where: { id }
    })
  }
}