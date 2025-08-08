import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyData() {
  console.log('🔍 Verifying dummy data...\n')
  
  // Check users
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: '@test.com'
      }
    }
  })
  console.log(`✅ Found ${users.length} dummy users`)
  
  // Check posts by category
  const categories = await prisma.boardCategory.findMany()
  
  for (const category of categories) {
    const posts = await prisma.post.findMany({
      where: {
        categoryId: category.id,
        isDeleted: false
      },
      include: {
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })
    
    const totalComments = posts.reduce((sum, post) => sum + post._count.comments, 0)
    const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0)
    
    console.log(`\n📌 ${category.name} (${category.boardType}):`)
    console.log(`   - Posts: ${posts.length}`)
    console.log(`   - Comments: ${totalComments}`)
    console.log(`   - Likes: ${totalLikes}`)
    console.log(`   - Pinned posts: ${posts.filter(p => p.isPinned).length}`)
  }
  
  // Overall statistics
  const totalPosts = await prisma.post.count({ where: { isDeleted: false } })
  const totalComments = await prisma.comment.count({ where: { isDeleted: false } })
  const totalLikes = await prisma.postLike.count()
  
  console.log('\n📊 Overall Statistics:')
  console.log(`- Total Posts: ${totalPosts}`)
  console.log(`- Total Comments: ${totalComments}`)
  console.log(`- Total Likes: ${totalLikes}`)
  
  // Sample posts
  console.log('\n📝 Sample Posts:')
  const samplePosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          username: true,
          level: true
        }
      },
      category: {
        select: {
          name: true
        }
      }
    }
  })
  
  samplePosts.forEach(post => {
    console.log(`- "${post.title}" by ${post.user.username} (Lv.${post.user.level}) in ${post.category?.name}`)
  })
}

verifyData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })