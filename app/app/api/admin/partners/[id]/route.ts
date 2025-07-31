import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { PartnerAdminService, PartnerDto } from '@/lib/services/partnerAdminService'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const partnerRepository = new PartnerRepository()
const partnerAdminService = new PartnerAdminService(partnerRepository)

interface RouteParams {
  params: {
    id: string
  }
}

// GET: 보증업체 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const partnerId = parseInt(params.id)
    const partner = await partnerRepository.findWithRelations(partnerId)

    if (!partner) {
      return NextResponse.json(
        { success: false, error: '보증업체를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partner
    })
  } catch (error) {
    console.error('보증업체 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PUT: 보증업체 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const partnerId = parseInt(params.id)
    const body = await request.json()
    
    const partner = await partnerAdminService.update(
      partnerId,
      body
    )

    return NextResponse.json({
      success: true,
      data: partner
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '입력 데이터가 올바르지 않습니다',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('보증업체 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE: 보증업체 삭제 (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    // ADMIN만 삭제 가능
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const partnerId = parseInt(params.id)
    await partnerAdminService.delete(partnerId)

    return NextResponse.json({
      success: true,
      message: '보증업체가 삭제되었습니다'
    })
  } catch (error) {
    console.error('보증업체 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}