import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPost6() {
  try {
    // Create a test post by testuser (ID 3)
    const testPost = await prisma.post.create({
      data: {
        userId: 3, // testuser
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: '개선된 StrictMode 수정 테스트',
        content: '이것은 setTimeout을 사용한 개선된 StrictMode 수정이 제대로 작동하는지 테스트하기 위한 게시글입니다.',
        summary: '개선된 수정 테스트',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Test post 6 created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost6()