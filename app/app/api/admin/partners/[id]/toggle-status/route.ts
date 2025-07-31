import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { PartnerAdminService } from '@/lib/services/partnerAdminService'

export const dynamic = 'force-dynamic'

const partnerRepository = new PartnerRepository()
const partnerAdminService = new PartnerAdminService(partnerRepository)

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH: 보증업체 상태 토글
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const partnerId = parseInt(params.id)
    const partner = await partnerAdminService.toggleStatus(partnerId)

    return NextResponse.json({
      success: true,
      data: partner,
      message: partner.isActive ? '보증업체가 활성화되었습니다' : '보증업체가 비활성화되었습니다'
    })
  } catch (error) {
    console.error('보증업체 상태 변경 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
}