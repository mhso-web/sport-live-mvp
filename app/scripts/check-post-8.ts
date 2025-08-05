import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPost8() {
  try {
    const post = await prisma.post.findUnique({
      where: { id: 8 },
      select: { id: true, title: true, views: true, userId: true }
    })
    
    console.log('Post 8 - Current views:', post?.views)
    console.log('Post 8 - Author ID:', post?.userId)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPost8()