import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { id: { in: [5, 6] } },
      select: { 
        id: true, 
        title: true, 
        views: true, 
        userId: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: { id: 'asc' }
    })
    
    console.log('Post View Counts:')
    posts.forEach(post => {
      console.log(`- Post ${post.id}: "${post.title}" by ${post.user.username} - Views: ${post.views}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllPosts()