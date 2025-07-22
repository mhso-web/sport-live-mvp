import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { PostService } from '@/lib/services/postService'
import { PostRepository } from '@/lib/repositories/postRepository'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { UserRepository } from '@/lib/repositories/userRepository'
import { handleApiError } from '@/lib/errors'
import { BoardType } from '@prisma/client'

const postRepository = new PostRepository()
const boardCategoryRepository = new BoardCategoryRepository()
const userRepository = new UserRepository()
const postService = new PostService(postRepository, boardCategoryRepository, userRepository)

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // 필터 파라미터 파싱
    const filters = {
      boardType: searchParams.get('boardType') as BoardType | undefined,
      categorySlug: searchParams.get('categorySlug') || undefined,
      userId: searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined,
      search: searchParams.get('search') || undefined,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined
    }

    // 페이지네이션 파라미터
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      orderBy: searchParams.get('orderBy') || 'createdAt',
      orderDir: (searchParams.get('orderDir') || 'desc') as 'asc' | 'desc'
    }

    const result = await postService.findAll(filters, pagination)

    return NextResponse.json({
      ...result,
      success: true
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/posts - 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        error: '로그인이 필요합니다',
        success: false
      }, { status: 401 })
    }

    const body = await request.json()
    
    const post = await postService.create(body, {
      userId: parseInt(session.user.id),
      userRole: session.user.role
    })

    return NextResponse.json({
      data: post,
      success: true
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}