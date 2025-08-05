import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPost3() {
  try {
    // Create a test post by testuser
    const testPost = await prisma.post.create({
      data: {
        userId: 2, // testuser
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: '실시간 조회수 테스트 게시글',
        content: '이것은 실시간 조회수 업데이트를 테스트하기 위한 게시글입니다.',
        summary: '실시간 업데이트 테스트',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Test post 3 created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost3()