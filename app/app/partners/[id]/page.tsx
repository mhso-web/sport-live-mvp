import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ViewCounter from '@/components/partners/ViewCounter'
import PartnerDetailContent from '@/components/partners/PartnerDetailContent'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const partner = await prisma.partner.findUnique({
    where: { id: parseInt(params.id) }
  })

  if (!partner) {
    return {
      title: '보증업체를 찾을 수 없습니다 - Sports Live',
      description: '요청하신 보증업체 정보를 찾을 수 없습니다.'
    }
  }

  return {
    title: `${partner.name} - Sports Live 보증업체`,
    description: partner.description || `${partner.name}의 상세 정보를 확인하세요.`,
    keywords: ['스포츠 베팅', '보증업체', partner.name, '스포츠 라이브'],
  }
}

async function getPartner(id: number) {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          ratings: true,
          comments: true,
          likes: true
        }
      }
    }
  })

  if (!partner) return null

  // 평균 평점 계산
  const avgRating = partner.ratings.length > 0
    ? partner.ratings.reduce((sum, rating) => sum + rating.rating, 0) / partner.ratings.length
    : 0

  return {
    ...partner,
    avgRating,
    totalRatings: partner._count.ratings,
    totalComments: partner._count.comments,
    totalLikes: partner._count.likes
  }
}

export default async function PartnerDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const partner = await getPartner(id)
  if (!partner) {
    notFound()
  }

  return (
    <>
      <ViewCounter partnerId={partner.id} />
      <PartnerDetailContent partner={partner} />
    </>
  )
}