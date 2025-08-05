import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPostViews() {
  try {
    const post = await prisma.post.findUnique({
      where: { id: 5 },
      select: { id: true, title: true, views: true, userId: true }
    })
    
    console.log('Post details:', post)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPostViews()