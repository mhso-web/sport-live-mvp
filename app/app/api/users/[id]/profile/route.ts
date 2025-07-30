import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { ExperienceService } from '@/lib/services/experienceService'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  bio: z.string().min(10).max(500).optional(),
  profileImage: z.string().url().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = parseInt(params.id)
    
    // 본인만 수정 가능
    if (!session?.user || parseInt(session.user.id) !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    
    // 현재 프로필 상태 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { bio: true, profileImage: true }
    })
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData
    })
    
    // 프로필 완성 체크 (bio와 profileImage가 모두 있을 때)
    if ((!currentUser.bio || !currentUser.profileImage) && 
        updatedUser.bio && updatedUser.profileImage) {
      // 이미 프로필 완성 경험치를 받았는지 확인
      const existingLog = await prisma.userExperienceLog.findFirst({
        where: {
          userId,
          actionType: 'PROFILE_COMPLETE'
        }
      })
      
      if (!existingLog) {
        await ExperienceService.awardExperience(userId, 'PROFILE_COMPLETE')
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        level: updatedUser.level,
        experience: updatedUser.experience
      }
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}