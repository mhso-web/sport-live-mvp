import { PrismaClient, BoardType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding posts...')

  // 테스트 사용자 생성
  const hashedPassword = await bcrypt.hash('test1234', 10)
  
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'USER',
      level: 5,
      experience: 250
    }
  })

  // 모든 카테고리 가져오기
  const categories = await prisma.boardCategory.findMany({
    where: { isActive: true }
  })

  // 각 카테고리별로 테스트 게시글 생성
  for (const category of categories) {
    const postCount = Math.floor(Math.random() * 5) + 8 // 8-12개의 게시글
    
    for (let i = 0; i < postCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30) // 0-30일 전
      const hoursAgo = Math.floor(Math.random() * 24)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)
      createdAt.setHours(createdAt.getHours() - hoursAgo)

      const sampleTitles = [
        `${category.name}에서 질문드립니다`,
        `오늘 경기 어떻게 보셨나요?`,
        `${category.name} 정보 공유합니다`,
        `이번 시즌 예측해봅시다`,
        `${category.name} 관련 뉴스 정리`,
        `초보자 질문있습니다`,
        `오늘의 하이라이트 모음`,
        `${category.name} 커뮤니티 모임 안내`,
        `경기 분석 자료 공유`,
        `${category.name} 최신 소식`,
        `이런 경우 어떻게 하시나요?`,
        `팬들과 함께 응원해요!`,
        `${category.name} 관련 팁 공유`,
        `오늘 경기 후기`,
        `다음 경기 일정 안내`
      ]

      const sampleContents = [
        '안녕하세요! 오늘 경기 정말 재미있었네요. 특히 후반전 역전극이 인상적이었습니다.',
        '이번 시즌 정말 기대됩니다. 여러분들은 어떻게 생각하시나요?',
        '유용한 정보 공유드립니다. 도움이 되셨으면 좋겠네요.',
        '오늘 경기 하이라이트 모음입니다. 놓치신 분들은 확인해보세요!',
        '초보자인데 궁금한 점이 있어서 질문드립니다. 답변 부탁드려요.',
        '최신 소식 업데이트입니다. 확인해보시고 의견 남겨주세요.',
        '다음 경기 일정 공유합니다. 함께 응원해요!',
        '분석 자료 정리해봤습니다. 참고하시면 좋을 것 같아요.',
        '오늘 경기 정말 아쉬웠네요. 다음엔 꼭 이기길 바랍니다.',
        '팬 여러분들과 소통하고 싶어서 글 남깁니다. 많은 참여 부탁드려요!'
      ]

      await prisma.post.create({
        data: {
          title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
          content: sampleContents[Math.floor(Math.random() * sampleContents.length)],
          summary: null,
          boardType: category.boardType,
          categoryId: category.id,
          userId: testUser.id,
          views: Math.floor(Math.random() * 1000),
          isPinned: i === 0 && Math.random() > 0.7, // 첫 번째 게시글은 30% 확률로 고정
          createdAt,
          updatedAt: createdAt
        }
      })
    }
  }

  console.log('Posts seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })