import { NextRequest } from 'next/server'
import { BoardService } from '@/lib/services/boardService'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { ApiResponse } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

const boardService = new BoardService(new BoardCategoryRepository())

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const boardType = searchParams.get('type')

    let categories
    if (boardType) {
      categories = await boardService.getCategoriesByType(boardType as any)
    } else {
      categories = await boardService.getAllCategories()
    }

    return ApiResponse.success(categories)
  } catch (error) {
    return ApiResponse.error(error)
  }
}