import { NextRequest, NextResponse } from 'next/server'
import { BoardService } from '@/lib/services/boardService'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { handleApiError } from '@/lib/errors'

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

    return NextResponse.json({
      data: categories,
      success: true
    })
  } catch (error) {
    return handleApiError(error)
  }
}