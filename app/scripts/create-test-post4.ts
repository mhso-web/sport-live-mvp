import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPost4() {
  try {
    // Create a test post by admin
    const testPost = await prisma.post.create({
      data: {
        userId: 1, // admin
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: 'StrictMode 수정 테스트 게시글',
        content: '이것은 React StrictMode에서 조회수 중복 증가 문제를 수정한 후 테스트하기 위한 게시글입니다.',
        summary: 'StrictMode 수정 테스트',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Test post 4 created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost4()