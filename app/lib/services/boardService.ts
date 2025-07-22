import { BoardType } from '@prisma/client'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { NotFoundException } from '@/lib/errors'

export class BoardService {
  constructor(
    private boardCategoryRepository: BoardCategoryRepository
  ) {}

  async getAllCategories() {
    return this.boardCategoryRepository.findActive()
  }

  async getCategoriesByType(boardType: BoardType) {
    return this.boardCategoryRepository.findByBoardType(boardType)
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.boardCategoryRepository.findBySlug(slug)
    
    if (!category || !category.isActive) {
      throw new NotFoundException('게시판을 찾을 수 없습니다')
    }

    return category
  }

  async getCategoryById(id: number) {
    const category = await this.boardCategoryRepository.findById(id)
    
    if (!category || !category.isActive) {
      throw new NotFoundException('게시판을 찾을 수 없습니다')
    }

    return category
  }

  // 관리자용 메서드 (나중에 권한 체크 추가)
  async createCategory(data: {
    boardType: BoardType
    slug: string
    name: string
    description?: string
    icon?: string
    color?: string
    seoTitle?: string
    seoKeywords?: string[]
  }) {
    return this.boardCategoryRepository.create(data)
  }

  async updateCategory(id: number, data: {
    name?: string
    description?: string
    orderIndex?: number
    isActive?: boolean
    icon?: string
    color?: string
    seoTitle?: string
    seoKeywords?: string[]
  }) {
    const category = await this.boardCategoryRepository.findById(id)
    
    if (!category) {
      throw new NotFoundException('게시판을 찾을 수 없습니다')
    }

    return this.boardCategoryRepository.update(id, data)
  }
}