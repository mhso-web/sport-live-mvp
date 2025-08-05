import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPost5() {
  try {
    // Create a test post by viewtestuser (ID 4)
    const testPost = await prisma.post.create({
      data: {
        userId: 4, // viewtestuser
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: 'ViewTestUser의 StrictMode 테스트 게시글',
        content: '이것은 다른 사용자가 작성한 게시글로 StrictMode 수정이 제대로 작동하는지 테스트하기 위한 게시글입니다.',
        summary: 'StrictMode 수정 확인',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Test post 5 created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost5()