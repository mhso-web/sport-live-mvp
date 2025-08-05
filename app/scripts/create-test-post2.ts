import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPost2() {
  try {
    // Create a test post by admin user
    const testPost = await prisma.post.create({
      data: {
        userId: 1, // admin user
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: '관리자 테스트 게시글',
        content: '이것은 관리자가 작성한 테스트 게시글입니다.',
        summary: '관리자 테스트',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Admin test post created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost2()