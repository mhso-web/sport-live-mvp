import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { PartnerAdminService, PartnerDto } from '@/lib/services/partnerAdminService'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const partnerRepository = new PartnerRepository()
const partnerAdminService = new PartnerAdminService(partnerRepository)

// GET: 관리자용 보증업체 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true'
      : undefined
    const sortBy = searchParams.get('sortBy') as 'latest' | 'rating' | 'popular' | 'name' | undefined

    const result = await partnerAdminService.findAllForAdmin(
      { search, isActive, sortBy },
      page,
      limit
    )

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    console.error('보증업체 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 목록을 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}

// POST: 새 보증업체 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 권한 확인 (ADMIN, SUB_ADMIN만 가능)
    if (!session?.user || !['ADMIN', 'SUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 데이터 검증
    const validatedData = PartnerDto.parse(body)
    
    const partner = await partnerAdminService.create(
      validatedData,
      parseInt(session.user.id)
    )

    return NextResponse.json({
      success: true,
      data: partner
    }, { status: 201 })
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

    console.error('보증업체 생성 실패:', error)
    return NextResponse.json(
      { success: false, error: '보증업체 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}