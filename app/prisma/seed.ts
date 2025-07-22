import { PrismaClient, BoardType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 기본 게시판 카테고리 생성
  const categories = [
    // 커뮤니티 하위 카테고리 (5개)
    {
      boardType: BoardType.COMMUNITY,
      slug: 'general',
      name: '자유게시판',
      description: '자유롭게 대화를 나누는 공간입니다',
      icon: '💬',
      color: '#3B82F6',
      orderIndex: 1,
      seoTitle: '스포츠 자유게시판',
      seoKeywords: ['스포츠 커뮤니티', '자유게시판', '스포츠 토론']
    },
    {
      boardType: BoardType.COMMUNITY,
      slug: 'football',
      name: '축구 게시판',
      description: '축구 관련 모든 이야기',
      icon: '⚽',
      color: '#10B981',
      orderIndex: 2,
      seoTitle: '축구 커뮤니티 게시판',
      seoKeywords: ['축구', '해외축구', 'K리그', '축구 커뮤니티']
    },
    {
      boardType: BoardType.COMMUNITY,
      slug: 'baseball',
      name: '야구 게시판',
      description: '야구 관련 모든 이야기',
      icon: '⚾',
      color: '#F59E0B',
      orderIndex: 3,
      seoTitle: '야구 커뮤니티 게시판',
      seoKeywords: ['야구', 'KBO', 'MLB', '야구 커뮤니티']
    },
    {
      boardType: BoardType.COMMUNITY,
      slug: 'esports',
      name: 'e스포츠 게시판',
      description: 'e스포츠 관련 모든 이야기',
      icon: '🎮',
      color: '#8B5CF6',
      orderIndex: 4,
      seoTitle: 'e스포츠 커뮤니티 게시판',
      seoKeywords: ['e스포츠', 'LCK', '게임', 'e스포츠 커뮤니티']
    },
    {
      boardType: BoardType.COMMUNITY,
      slug: 'basketball',
      name: '농구 게시판',
      description: '농구 관련 모든 이야기',
      icon: '🏀',
      color: '#EF4444',
      orderIndex: 5,
      seoTitle: '농구 커뮤니티 게시판',
      seoKeywords: ['농구', 'KBL', 'NBA', '농구 커뮤니티']
    }
  ]

  // 카테고리 생성 또는 업데이트
  for (const category of categories) {
    await prisma.boardCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    })
    console.log(`✅ Created/Updated category: ${category.name}`)
  }

  // 테스트용 관리자 계정 생성 (선택사항)
  const adminEmail = 'admin@sportslive.com'
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: 'admin',
      email: adminEmail,
      passwordHash: '$2a$10$XQq9pEJmRQVxWJYaRnFgE.h0HMFgLrCVCIUaVZTwU0SyepIxurcR2', // password: admin123
      role: 'ADMIN',
      level: 99,
      experience: 999999
    }
  })
  console.log(`✅ Created/Updated admin user: ${adminUser.username}`)

  console.log('🌱 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })