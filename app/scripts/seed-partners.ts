import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function seedPartners() {
  try {
    console.log('🌱 Creating partner data...')

    // 먼저 테스트 사용자들 생성
    const testUsers = []
    for (let i = 1; i <= 10; i++) {
      const user = await prisma.user.upsert({
        where: { username: `testuser${i}` },
        update: {},
        create: {
          username: `testuser${i}`,
          email: `testuser${i}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          experience: Math.floor(Math.random() * 1000),
          level: Math.floor(Math.random() * 10) + 1
        }
      })
      testUsers.push(user)
    }
    console.log(`✅ Created ${testUsers.length} test users`)

    const partners = [
      {
        name: '스포츠토토365',
        description: '안전하고 신뢰할 수 있는 스포츠 베팅 사이트입니다. 다양한 스포츠 종목과 실시간 베팅을 제공합니다.',
        detailContent: '스포츠토토365는 국내 최고의 스포츠 베팅 사이트입니다.\n\n- 첫충전 100% 보너스\n- 매충전 10% 보너스\n- 실시간 스포츠 중계\n- 24시간 고객센터 운영\n\n안전하고 빠른 입출금을 보장합니다.',
        websiteUrl: 'https://sportstoto365.com',
        bannerImage: 'https://via.placeholder.com/800x200/FFD700/000000?text=SportsToto365+Banner',
        isActive: true,
        viewCount: 1523,
        createdBy: 1 // admin user ID
      },
      {
        name: '윈윈벳',
        description: '높은 배당률과 다양한 이벤트를 제공하는 프리미엄 베팅 사이트입니다.',
        detailContent: '윈윈벳은 업계 최고의 배당률을 자랑합니다.\n\n- 첫충전 200% 보너스\n- 매일 출석 체크 이벤트\n- 라이브 베팅 지원\n- 모바일 완벽 지원\n\n다양한 이벤트와 혜택을 제공합니다.',
        websiteUrl: 'https://winwinbet.com',
        bannerImage: 'https://via.placeholder.com/800x200/32CD32/FFFFFF?text=WinWinBet+Banner',
        isActive: true,
        viewCount: 2341,
        createdBy: 1
      },
      {
        name: '메가스포츠',
        description: '국내 최대 규모의 스포츠 베팅 플랫폼입니다. 안전한 거래와 빠른 환전을 보장합니다.',
        detailContent: '메가스포츠는 국내 최대 규모의 베팅 사이트입니다.\n\n- 매충전 10% 보너스\n- 실시간 입출금\n- 업계 최고 배당률\n- VIP 전용 혜택\n\n10년 이상의 운영 노하우로 안전한 서비스를 제공합니다.',
        websiteUrl: 'https://megasports.com',
        bannerImage: 'https://via.placeholder.com/800x200/FF4500/FFFFFF?text=MegaSports+Banner',
        isActive: true,
        viewCount: 3892,
        createdBy: 1
      },
      {
        name: '베팅킹',
        description: '초보자도 쉽게 이용할 수 있는 친절한 베팅 사이트입니다.',
        detailContent: '베팅킹은 초보자를 위한 최고의 선택입니다.\n\n- 가입 첫충 100% 보너스\n- 초보자 가이드 제공\n- 1:1 맞춤 상담\n- 낮은 최소 베팅금\n\n처음 시작하는 분들께 추천합니다.',
        websiteUrl: 'https://bettingking.com',
        bannerImage: 'https://via.placeholder.com/800x200/9370DB/FFFFFF?text=BettingKing+Banner',
        isActive: false,
        viewCount: 892,
        createdBy: 1
      }
    ]

    for (const partner of partners) {
      const created = await prisma.partner.upsert({
        where: { name: partner.name },
        update: partner,
        create: partner
      })
      console.log(`✅ Created/Updated partner: ${created.name}`)

      // 기존 데이터 삭제 (cascade로 연관 데이터도 삭제됨)
      await prisma.partnerRating.deleteMany({ where: { partnerId: created.id } })
      await prisma.partnerComment.deleteMany({ where: { partnerId: created.id } })
      await prisma.partnerLike.deleteMany({ where: { partnerId: created.id } })

      // 몇 개의 평점 추가 (각 사용자는 한 번만 평점 가능)
      const ratingCount = Math.floor(Math.random() * testUsers.length) + 3
      const ratingUsers = testUsers.slice(0, ratingCount)
      
      for (const user of ratingUsers) {
        await prisma.partnerRating.create({
          data: {
            partnerId: created.id,
            userId: user.id,
            rating: Math.floor(Math.random() * 2) + 4 // 4-5점
          }
        })
      }

      // 몇 개의 댓글 추가
      const commentCount = Math.floor(Math.random() * 10) + 3
      for (let i = 0; i < commentCount; i++) {
        const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)]
        const comments = [
          '정말 안전한 업체입니다. 추천해요!',
          '빠른 환전이 인상적이네요',
          '이벤트가 많아서 좋습니다',
          '고객센터 응대가 친절해요',
          '오래된 업체라 믿을만합니다',
          '첫충 보너스가 매력적이네요',
          '모바일에서도 잘 작동합니다',
          '인터페이스가 깔끔해서 좋아요'
        ]
        await prisma.partnerComment.create({
          data: {
            partnerId: created.id,
            userId: randomUser.id,
            content: comments[Math.floor(Math.random() * comments.length)]
          }
        })
      }

      // 몇 개의 좋아요 추가 (각 사용자는 한 번만 좋아요 가능)
      const likeCount = Math.min(Math.floor(Math.random() * testUsers.length) + 5, testUsers.length)
      const likeUsers = [...testUsers].sort(() => Math.random() - 0.5).slice(0, likeCount)
      
      for (const user of likeUsers) {
        try {
          await prisma.partnerLike.create({
            data: {
              partnerId: created.id,
              userId: user.id
            }
          })
        } catch (e) {
          // 중복 좋아요는 무시
        }
      }
    }

    console.log('🌱 Partner seed completed!')
  } catch (error) {
    console.error('Error seeding partners:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPartners()