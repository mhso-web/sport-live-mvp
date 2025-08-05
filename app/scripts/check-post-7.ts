import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPost7() {
  try {
    const post = await prisma.post.findUnique({
      where: { id: 7 },
      select: { id: true, title: true, views: true }
    })
    
    console.log('Post 7 - Current views:', post?.views)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPost7()