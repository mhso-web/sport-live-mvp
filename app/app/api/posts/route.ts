import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { getPostService, getUserRepository } from '@/lib/container'
import { handleApiError } from '@/lib/errors'
import { BoardType } from '@prisma/client'
import { PAGINATION_DEFAULTS, API_MESSAGES } from '@/lib/constants/app.constants'

export const dynamic = 'force-dynamic'

// Get services from DI container
const postService = getPostService()
const userRepository = getUserRepository()

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
      limit: parseInt(searchParams.get('limit') || String(PAGINATION_DEFAULTS.LIMIT)),
      orderBy: searchParams.get('orderBy') || PAGINATION_DEFAULTS.ORDER_BY,
      order: (searchParams.get('orderDir') || PAGINATION_DEFAULTS.ORDER_DIR) as 'asc' | 'desc'
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
        error: API_MESSAGES.AUTH.LOGIN_REQUIRED,
        success: false
      }, { status: 401 })
    }

    const body = await request.json()
    
    const post = await postService.create(body, {
      userId: parseInt(session.user.id),
      userRole: session.user.role
    })

    // 최신 사용자 정보 가져오기
    const user = await userRepository.findById(parseInt(session.user.id))

    return NextResponse.json({
      data: post,
      userLevel: user?.level || session.user.level,
      userExperience: user?.experience || session.user.experience,
      success: true
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}