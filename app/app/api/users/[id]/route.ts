import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserRepository } from '@/lib/repositories/userRepository'
import { UserService } from '@/lib/services/userService'
import { ExperienceService } from '@/lib/services/experienceService'
import { UpdateProfileDto } from '@/lib/dto/user/updateProfile.dto'
import { handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const userRepository = new UserRepository()
const experienceService = new ExperienceService()
const userService = new UserService(userRepository, experienceService)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const profile = await userService.getUserProfile(userId)
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 세션 확인 (선택적 - 비공개 정보 숨김용)
    const session = await getServerSession(authOptions)
    const isOwnProfile = session?.user?.id === params.id

    // 본인이 아닌 경우 이메일 숨김
    if (!isOwnProfile && profile.user.email) {
      const emailParts = profile.user.email.split('@')
      if (emailParts.length === 2) {
        const maskedLocal = emailParts[0].substring(0, 2) + '***'
        profile.user.email = `${maskedLocal}@${emailParts[1]}`
      }
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

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
    const validatedData = UpdateProfileDto.parse(body)

    const updatedUser = await userService.updateProfile(userId, validatedData, currentUserId)

    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    return handleApiError(error)
  }
}