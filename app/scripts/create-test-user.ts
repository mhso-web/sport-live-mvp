import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('test1234', 10)
    
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: hashedPassword,
        level: 5,
        experience: 500,
        role: 'USER'
      }
    })
    
    console.log('Test user created:', testUser)
    
    // Create a test post
    const testPost = await prisma.post.create({
      data: {
        userId: testUser.id,
        boardType: 'COMMUNITY',
        categoryId: 1, // general category
        title: '테스트 게시글입니다',
        content: '이것은 조회수 테스트를 위한 게시글입니다.',
        summary: '조회수 테스트용',
        views: 0,
        likesCount: 0,
        commentsCount: 0
      }
    })
    
    console.log('Test post created:', testPost)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()