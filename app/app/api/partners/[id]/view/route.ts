import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid partner ID' },
        { status: 400 }
      )
    }

    // 조회수 증가
    const partner = await prisma.partner.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { viewCount: partner.viewCount }
    })
  } catch (error: any) {
    console.error('Error incrementing view count:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}