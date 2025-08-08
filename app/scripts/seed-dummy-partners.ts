import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 더미 보증업체 데이터
const dummyPartners = [
  {
    name: '스포츠토토365',
    description: '국내 최고의 스포츠 베팅 플랫폼',
    detailContent: `스포츠토토365는 10년 이상의 운영 경험을 바탕으로 안전하고 신뢰할 수 있는 스포츠 베팅 서비스를 제공합니다.

주요 특징:
- 24시간 고객센터 운영
- 실시간 경기 중계 제공
- 다양한 스포츠 종목 지원
- 빠른 충전 및 환전 시스템
- 모바일 앱 지원

보증금: 5억원
가입 코드: SPORTS365`,
    websiteUrl: 'https://example-sports365.com',
    bannerImage: 'https://picsum.photos/1200/400?random=1',
  },
  {
    name: '메이저벳',
    description: '검증된 메이저 베팅 사이트',
    detailContent: `메이저벳은 업계 최고의 배당률과 다양한 이벤트를 제공하는 프리미엄 베팅 플랫폼입니다.

특별 혜택:
- 첫 충전 30% 보너스
- 매일 첫 베팅 10% 페이백
- VIP 등급별 혜택
- 라이브 카지노 동시 이용 가능

보증금: 3억원
추천 코드: MAJOR2024`,
    websiteUrl: 'https://example-majorbet.com',
    bannerImage: 'https://picsum.photos/1200/400?random=2',
  },
  {
    name: '벳365코리아',
    description: '글로벌 베팅의 한국 공식 파트너',
    detailContent: `세계적인 베팅 브랜드 벳365의 한국 공식 파트너사입니다.

서비스 특징:
- 전 세계 스포츠 경기 베팅 가능
- 한국어 완벽 지원
- 원화 입출금 지원
- 라이브 스트리밍 무료 제공
- 모바일 최적화

보증금: 10억원
가입 혜택: 최대 20만원 보너스`,
    websiteUrl: 'https://example-bet365kr.com',
    bannerImage: 'https://picsum.photos/1200/400?random=3',
  },
  {
    name: '스포츠맨',
    description: '스포츠 전문 베팅 플랫폼',
    detailContent: `스포츠맨은 스포츠 베팅에 특화된 전문 플랫폼으로, 최고의 분석 도구를 제공합니다.

주요 기능:
- AI 경기 분석 제공
- 전문가 픽 서비스
- 통계 기반 베팅 가이드
- 커뮤니티 기능
- 베팅 시뮬레이터

보증금: 2억원
특별 혜택: 분석 도구 무료 이용`,
    websiteUrl: 'https://example-sportsman.com',
    bannerImage: 'https://picsum.photos/1200/400?random=4',
  },
  {
    name: '위너스',
    description: '승리를 위한 최고의 선택',
    detailContent: `위너스는 높은 당첨률과 안전한 운영으로 유명한 베팅 사이트입니다.

특별 서비스:
- 업계 최고 배당률
- 즉시 환전 시스템
- 다양한 미니게임
- 포인트 적립 시스템
- 추천인 혜택

보증금: 4억원
가입 보너스: 10만원 즉시 지급`,
    websiteUrl: 'https://example-winners.com',
    bannerImage: 'https://picsum.photos/1200/400?random=5',
  },
  {
    name: '골드벳',
    description: 'VIP를 위한 프리미엄 베팅',
    detailContent: `골드벳은 VIP 회원을 위한 프리미엄 베팅 서비스를 제공합니다.

VIP 혜택:
- 전담 매니저 배정
- 무제한 베팅 한도
- 특별 이벤트 초대
- 최우선 출금 처리
- 프리미엄 분석 자료 제공

보증금: 7억원
VIP 가입 문의: 24시간 상담`,
    websiteUrl: 'https://example-goldbet.com',
    bannerImage: 'https://picsum.photos/1200/400?random=6',
  },
  {
    name: '라이브벳',
    description: '실시간 베팅의 진수',
    detailContent: `라이브벳은 실시간 베팅에 특화된 플랫폼으로, 경기 중 베팅의 재미를 극대화합니다.

실시간 기능:
- HD 라이브 스트리밍
- 실시간 통계 업데이트
- 인플레이 베팅
- 캐시아웃 기능
- 멀티뷰 지원

보증금: 3억원
특별 혜택: 라이브 베팅 5% 추가 보너스`,
    websiteUrl: 'https://example-livebet.com',
    bannerImage: 'https://picsum.photos/1200/400?random=7',
  },
  {
    name: '챔피언벳',
    description: '챔피언을 위한 베팅 플랫폼',
    detailContent: `챔피언벳은 프로 베터들이 선택하는 전문 베팅 플랫폼입니다.

전문가 서비스:
- 프로 베터 커뮤니티
- 고급 통계 분석
- 자동 베팅 시스템
- 리스크 관리 도구
- 수익률 추적 기능

보증금: 5억원
프로 등급 혜택: 수수료 면제`,
    websiteUrl: 'https://example-championbet.com',
    bannerImage: 'https://picsum.photos/1200/400?random=8',
  },
  {
    name: '스타벳',
    description: '스타들이 선택한 베팅 사이트',
    detailContent: `유명 스포츠 스타들과 함께하는 스타벳입니다.

스타 콜라보:
- 스타 추천 베팅
- 스타와의 만남 이벤트
- 사인 상품 증정
- 스타 전용 채팅방
- 특별 영상 콘텐츠

보증금: 6억원
스타 코드: STAR2024`,
    websiteUrl: 'https://example-starbet.com',
    bannerImage: 'https://picsum.photos/1200/400?random=9',
  },
  {
    name: '안전놀이터',
    description: '100% 안전 보증 베팅',
    detailContent: `안전놀이터는 회원님의 안전을 최우선으로 하는 검증된 베팅 플랫폼입니다.

안전 보장:
- 365일 먹튀 보증
- 개인정보 완벽 보호
- SSL 암호화 적용
- 정부 인증 획득
- 24시간 모니터링

보증금: 8억원
안전 보증: 100% 보상`,
    websiteUrl: 'https://example-safeplay.com',
    bannerImage: 'https://picsum.photos/1200/400?random=10',
  },
]

// 파트너 댓글 템플릿
const commentTemplates = [
  '정말 안전하고 좋은 사이트입니다. 출금도 빠르고 좋아요!',
  '여기서 베팅한지 1년 됐는데 한번도 문제 없었어요',
  '고객센터 응대가 정말 친절하고 빠릅니다',
  '다른 사이트보다 배당률이 높아서 좋아요',
  '모바일에서도 잘 되고 편리합니다',
  '이벤트가 많아서 재밌게 하고 있어요',
  '출금 신청하면 바로바로 처리해줘서 신뢰가 갑니다',
  '라이브 스트리밍 화질이 정말 좋네요',
  '처음엔 걱정했는데 정말 안전한 사이트 맞네요',
  '친구 추천으로 가입했는데 만족하고 있습니다',
  'VIP 혜택이 정말 좋아요. 강추합니다!',
  '분석 자료가 도움이 많이 됩니다',
  '인터페이스가 깔끔하고 사용하기 편해요',
  '베팅 종류가 다양해서 좋습니다',
  '신규 가입 보너스 잘 받았습니다!',
]

async function createDummyPartners() {
  console.log('🏢 Creating dummy partners...')
  
  // Get admin user for createdBy
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })
  
  if (!adminUser) {
    console.error('❌ Admin user not found!')
    return []
  }
  
  const createdPartners = []
  
  for (const partnerData of dummyPartners) {
    try {
      const partner = await prisma.partner.create({
        data: {
          ...partnerData,
          createdBy: adminUser.id,
          viewCount: Math.floor(Math.random() * 10000) + 1000,
        }
      })
      createdPartners.push(partner)
      console.log(`✅ Created partner: ${partner.name}`)
    } catch (error) {
      console.log(`⚠️  Partner ${partnerData.name} might already exist, skipping...`)
    }
  }
  
  return createdPartners
}

async function createPartnerData(partners: any[], users: any[]) {
  console.log('\n📊 Creating partner ratings, comments, and likes...')
  
  for (const partner of partners) {
    console.log(`\n🎯 Processing ${partner.name}...`)
    
    // Create ratings (10-20 per partner)
    const ratingCount = Math.floor(Math.random() * 11) + 10
    let totalRating = 0
    
    for (let i = 0; i < ratingCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const rating = Math.random() < 0.7 ? 5 : 4 // 70% 5-stars, 30% 4-stars
      
      try {
        await prisma.partnerRating.create({
          data: {
            partnerId: partner.id,
            userId: user.id,
            rating: rating,
          }
        })
        totalRating += rating
      } catch (e) {
        // User already rated this partner
      }
    }
    
    console.log(`  ⭐ Created ${ratingCount} ratings (avg: ${(totalRating / ratingCount).toFixed(1)})`)
    
    // Create comments (5-15 per partner)
    const commentCount = Math.floor(Math.random() * 11) + 5
    
    for (let i = 0; i < commentCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const comment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)]
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60)) // Random date within last 60 days
      
      try {
        await prisma.partnerComment.create({
          data: {
            partnerId: partner.id,
            userId: user.id,
            content: comment,
            createdAt: randomDate,
          }
        })
      } catch (e) {
        console.error(`Error creating comment:`, e)
      }
    }
    
    console.log(`  💬 Created ${commentCount} comments`)
    
    // Create likes (20-50 per partner)
    const likeCount = Math.floor(Math.random() * 31) + 20
    let actualLikes = 0
    
    for (let i = 0; i < likeCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      
      try {
        await prisma.partnerLike.create({
          data: {
            partnerId: partner.id,
            userId: user.id,
          }
        })
        actualLikes++
      } catch (e) {
        // User already liked this partner
      }
    }
    
    console.log(`  ❤️  Created ${actualLikes} likes`)
  }
}

async function main() {
  try {
    console.log('🚀 Starting partner dummy data generation...\n')
    
    // Get existing users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: '@test.com' } },
          { role: 'USER' }
        ]
      }
    })
    
    if (users.length === 0) {
      console.error('❌ No users found! Please run seed-dummy-data.ts first.')
      return
    }
    
    console.log(`✅ Found ${users.length} users for partner interactions`)
    
    // Create partners
    const partners = await createDummyPartners()
    
    if (partners.length === 0) {
      console.log('⚠️  No new partners created. They might already exist.')
      // Get existing partners
      const existingPartners = await prisma.partner.findMany({
        where: {
          name: {
            in: dummyPartners.map(p => p.name)
          }
        }
      })
      
      if (existingPartners.length > 0) {
        await createPartnerData(existingPartners, users)
      }
    } else {
      // Create partner data
      await createPartnerData(partners, users)
    }
    
    console.log('\n✅ Partner dummy data generation completed!')
    
    // Print statistics
    const partnerCount = await prisma.partner.count()
    const ratingCount = await prisma.partnerRating.count()
    const commentCount = await prisma.partnerComment.count()
    const likeCount = await prisma.partnerLike.count()
    
    console.log('\n📊 Partner Statistics:')
    console.log(`- Total Partners: ${partnerCount}`)
    console.log(`- Total Ratings: ${ratingCount}`)
    console.log(`- Total Comments: ${commentCount}`)
    console.log(`- Total Likes: ${likeCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()