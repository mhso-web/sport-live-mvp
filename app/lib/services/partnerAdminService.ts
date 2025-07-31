import { Partner, Prisma } from '@prisma/client'
import { PartnerRepository, PartnerWithRelations } from '@/lib/repositories/partnerRepository'
import { z } from 'zod'

// 보증업체 생성/수정 DTO
export const PartnerDto = z.object({
  name: z.string().min(1, '업체명은 필수입니다').max(100),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다'),
  detailContent: z.string().min(1, '상세 내용은 필수입니다'),
  websiteUrl: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  bannerImage: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true)
})

export type PartnerDto = z.infer<typeof PartnerDto>

export interface PartnerAdminFilters {
  isActive?: boolean
  search?: string
  sortBy?: 'latest' | 'rating' | 'popular' | 'name'
  startDate?: Date
  endDate?: Date
}

export class PartnerAdminService {
  constructor(
    private partnerRepository: PartnerRepository
  ) {}

  // 관리자용 보증업체 목록 조회 (더 많은 정보 포함)
  async findAllForAdmin(
    filters: PartnerAdminFilters,
    page: number = 1,
    limit: number = 20
  ) {
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

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    // 정렬 옵션 설정
    let orderBy: Prisma.PartnerOrderByWithRelationInput = { createdAt: 'desc' }
    if (filters.sortBy === 'name') {
      orderBy = { name: 'asc' }
    }

    return this.partnerRepository.findByFilters(
      filters,
      { page, limit, orderBy: 'createdAt', order: 'desc' }
    )
  }

  // 보증업체 생성
  async create(data: PartnerDto, createdBy: number) {
    const validated = PartnerDto.parse(data)
    
    return this.partnerRepository.create({
      ...validated,
      createdBy
    })
  }

  // 보증업체 수정
  async update(id: number, data: Partial<PartnerDto>) {
    const partner = await this.partnerRepository.findById(id)
    if (!partner) {
      throw new Error('보증업체를 찾을 수 없습니다')
    }

    const validated = PartnerDto.partial().parse(data)
    
    return this.partnerRepository.update(id, validated)
  }

  // 보증업체 삭제 (soft delete)
  async delete(id: number) {
    const partner = await this.partnerRepository.findById(id)
    if (!partner) {
      throw new Error('보증업체를 찾을 수 없습니다')
    }

    return this.partnerRepository.delete(id)
  }

  // 보증업체 상태 토글
  async toggleStatus(id: number) {
    const partner = await this.partnerRepository.findById(id)
    if (!partner) {
      throw new Error('보증업체를 찾을 수 없습니다')
    }

    return this.partnerRepository.update(id, {
      isActive: !partner.isActive
    })
  }

  // 보증업체 통계 조회
  async getStats() {
    const total = await this.partnerRepository.count()
    const activeCount = await this.partnerRepository.count({ where: { isActive: true } })
    const inactiveCount = total - activeCount

    // 인기 보증업체 TOP 5
    const popularPartners = await this.partnerRepository.findAllWithStats(
      { likes: { _count: 'desc' } },
      5
    )

    // 평점 높은 보증업체 TOP 5
    const topRatedPartners = await this.partnerRepository.findAllWithStats(
      undefined,
      5
    )

    return {
      total,
      activeCount,
      inactiveCount,
      popularPartners,
      topRatedPartners
    }
  }
}