import { PrismaClient, BoardType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating test data...')

  // 1. Create 10 dummy users
  const users = []
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { username: `testuser${i}` },
      update: {},
      create: {
        username: `testuser${i}`,
        email: `testuser${i}@test.com`,
        passwordHash: await bcrypt.hash('password123', 10),
        role: i === 1 ? 'ANALYST' : 'USER',
        level: Math.floor(Math.random() * 50) + 1,
        experience: Math.floor(Math.random() * 5000),
        isActive: true
      }
    })
    users.push(user)
    console.log(`✅ Created user: ${user.username} (Lv.${user.level})`)
  }

  // 2. Get all board categories
  const categories = await prisma.boardCategory.findMany()
  console.log(`📂 Found ${categories.length} board categories`)

  // 3. Create 20-30 posts per category
  const postTitles = [
    '오늘 경기 어떻게 보시나요?',
    '이번 시즌 우승 예상',
    '선수 이적 소식',
    '경기 분석 공유합니다',
    '팀 전력 분석',
    '오늘의 베스트 플레이',
    '경기 일정 정보',
    '팬미팅 후기',
    '직관 후기 남겨요',
    '선수 인터뷰 영상',
    '역대급 경기였습니다',
    '오늘 경기 예측',
    '팀 응원합시다!',
    '감독 교체 소식',
    '부상 선수 업데이트',
    '신인 선수 평가',
    '경기장 분위기 최고',
    'MVP 후보 예상',
    '시즌 중간 평가',
    '다음 경기 전망',
    '훈련 영상 공유',
    '팀 전술 분석',
    '상대팀 분석',
    '오늘의 하이라이트',
    '경기 통계 분석',
    '선수 개인기록 달성',
    '팀 연승 행진 중',
    '오늘 경기 라인업',
    '심판 판정 논란',
    '경기 후 인터뷰'
  ]

  const postContents = [
    '정말 흥미로운 경기였습니다. 양 팀 모두 최선을 다했네요.',
    '이번 시즌 정말 기대됩니다. 우리 팀이 우승할 수 있을까요?',
    '선수들의 컨디션이 점점 좋아지고 있는 것 같습니다.',
    '오늘 경기는 정말 손에 땀을 쥐게 했네요.',
    '팀워크가 정말 좋아 보입니다. 앞으로가 기대돼요.',
    '감독님의 전술이 정말 적중했습니다.',
    '다음 경기도 이런 플레이를 보여줬으면 좋겠네요.',
    '홈 관중들의 응원이 정말 대단했습니다.',
    '선수들이 정말 열심히 뛰었습니다. 감동적이네요.',
    '부상 없이 시즌 마무리했으면 좋겠습니다.'
  ]

  for (const category of categories) {
    const postCount = Math.floor(Math.random() * 11) + 20 // 20-30 posts
    
    for (let i = 0; i < postCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomTitle = postTitles[Math.floor(Math.random() * postTitles.length)]
      const randomContent = postContents[Math.floor(Math.random() * postContents.length)]
      
      const post = await prisma.post.create({
        data: {
          title: `[${category.name}] ${randomTitle}`,
          content: randomContent + `\n\n${category.name}에 대한 이야기입니다.`,
          category: {
            connect: { id: category.id }
          },
          boardType: category.boardType,
          user: {
            connect: { id: randomUser.id }
          },
          views: Math.floor(Math.random() * 500),
          likesCount: Math.floor(Math.random() * 50),
          isPinned: Math.random() > 0.95, // 5% chance to be pinned
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
        }
      })

      // Add some comments randomly (30% chance)
      if (Math.random() > 0.7) {
        const commentCount = Math.floor(Math.random() * 5) + 1
        for (let j = 0; j < commentCount; j++) {
          const commentUser = users[Math.floor(Math.random() * users.length)]
          await prisma.comment.create({
            data: {
              content: ['좋은 글이네요!', '동의합니다', '저도 그렇게 생각해요', '좋은 정보 감사합니다', '다른 의견도 있을 것 같아요'][Math.floor(Math.random() * 5)],
              post: {
                connect: { id: post.id }
              },
              user: {
                connect: { id: commentUser.id }
              }
            }
          })
        }
      }
    }
    
    console.log(`✅ Created ${postCount} posts for ${category.name}`)
  }

  // 4. Create some likes
  const allPosts = await prisma.post.findMany({ take: 50 })
  for (const post of allPosts) {
    const likeCount = Math.floor(Math.random() * 3)
    for (let i = 0; i < likeCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      try {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: randomUser.id
          }
        })
      } catch (e) {
        // Ignore duplicate likes
      }
    }
  }

  console.log('✅ Test data creation completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error creating test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })