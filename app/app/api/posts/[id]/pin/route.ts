import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { PostService } from '@/lib/services/postService'
import { PostRepository } from '@/lib/repositories/postRepository'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { UserRepository } from '@/lib/repositories/userRepository'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const postRepository = new PostRepository()
const boardCategoryRepository = new BoardCategoryRepository()
const userRepository = new UserRepository()
const postService = new PostService(postRepository, boardCategoryRepository, userRepository)

// PATCH /api/posts/[id]/pin - 게시글 고정 토글
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        error: '로그인이 필요합니다',
        success: false
      }, { status: 401 })
    }

    const postId = parseInt(params.id)
    
    if (isNaN(postId)) {
      return NextResponse.json({
        error: '유효하지 않은 게시글 ID입니다',
        success: false
      }, { status: 400 })
    }

    await postService.togglePin(postId, {
      userId: parseInt(session.user.id),
      userRole: session.user.role
    })

    return NextResponse.json({
      success: true,
      message: '게시글 고정 상태가 변경되었습니다'
    })
  } catch (error) {
    return handleApiError(error)
  }
}