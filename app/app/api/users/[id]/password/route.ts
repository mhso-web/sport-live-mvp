import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserRepository } from '@/lib/repositories/userRepository'
import { UserService } from '@/lib/services/userService'
import { ExperienceService } from '@/lib/services/experienceService'
import { ChangePasswordDto } from '@/lib/dto/user/updateProfile.dto'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const userRepository = new UserRepository()
const experienceService = new ExperienceService()
const userService = new UserService(userRepository, experienceService)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(params.id)
    const currentUserId = parseInt(session.user.id)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = ChangePasswordDto.parse(body)

    await userService.changePassword(userId, validatedData, currentUserId)

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다'
    })
  } catch (error) {
    return handleApiError(error)
  }
}