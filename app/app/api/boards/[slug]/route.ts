import { NextRequest, NextResponse } from 'next/server'
import { BoardService } from '@/lib/services/boardService'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { handleApiError } from '@/lib/errors'

const boardService = new BoardService(new BoardCategoryRepository())

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await boardService.getCategoryBySlug(params.slug)

    return NextResponse.json({
      data: category,
      success: true
    })
  } catch (error) {
    return handleApiError(error)
  }
}