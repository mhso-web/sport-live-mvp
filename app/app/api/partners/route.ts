import { NextRequest, NextResponse } from 'next/server'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { handleApiError } from '@/lib/errors'

const partnerRepository = new PartnerRepository()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters = {
      isActive: true,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as 'latest' | 'rating' | 'popular' | undefined
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12')
    }

    const result = await partnerRepository.findByFilters(filters, pagination)

    return NextResponse.json({
      data: result.data.map(partner => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        bannerImage: partner.bannerImage,
        avgRating: partner.avgRating || 0,
        totalRatings: partner._count.ratings,
        totalComments: partner._count.comments,
        totalLikes: partner._count.likes
      })),
      meta: result.meta,
      success: true
    })
  } catch (error) {
    return handleApiError(error)
  }
}