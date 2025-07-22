import { Inquiry, InquiryResponse, InquiryStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { IRepository, PaginationParams, PaginatedResult } from './baseRepository'

export interface InquiryWithRelations extends Inquiry {
  user: {
    id: number
    username: string
    email: string | null
  }
  responses: (InquiryResponse & {
    admin: {
      id: number
      username: string
    }
  })[]
  _count: {
    responses: number
  }
}

export interface InquiryFilters {
  userId?: number
  status?: InquiryStatus
  search?: string
}

export class InquiryRepository implements IRepository<Inquiry> {
  async findById(id: number): Promise<Inquiry | null> {
    return prisma.inquiry.findUnique({
      where: { id }
    })
  }

  async findWithRelations(id: number): Promise<InquiryWithRelations | null> {
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        responses: {
          include: {
            admin: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      }
    })
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Inquiry>> {
    const { page = 1, limit = 20, orderBy = 'createdAt', order = 'desc' } = params || {}
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        orderBy: { [orderBy]: order }
      }),
      prisma.inquiry.count({ where: { isDeleted: false } })
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
    filters: InquiryFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<InquiryWithRelations>> {
    const { page = 1, limit = 20, orderBy = 'createdAt', order = 'desc' } = params || {}
    const skip = (page - 1) * limit

    const where: Prisma.InquiryWhereInput = {
      isDeleted: false
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [data, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          responses: {
            include: {
              admin: {
                select: { id: true, username: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { responses: true }
          }
        },
        skip,
        take: limit,
        orderBy: { [orderBy]: order }
      }),
      prisma.inquiry.count({ where })
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

  async create(data: Prisma.InquiryCreateInput): Promise<Inquiry> {
    return prisma.inquiry.create({ data })
  }

  async update(id: number, data: Prisma.InquiryUpdateInput): Promise<Inquiry> {
    return prisma.inquiry.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.inquiry.update({
      where: { id },
      data: { isDeleted: true }
    })
  }

  async createResponse(inquiryId: number, adminId: number, content: string): Promise<InquiryResponse> {
    // 문의 상태를 IN_PROGRESS로 변경
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: 'IN_PROGRESS' }
    })

    return prisma.inquiryResponse.create({
      data: {
        inquiryId,
        adminId,
        content
      }
    })
  }
}