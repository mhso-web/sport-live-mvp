import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyPartnerData() {
  console.log('🔍 Verifying partner data...\n')
  
  // Get all partners
  const partners = await prisma.partner.findMany({
    include: {
      _count: {
        select: {
          ratings: true,
          comments: true,
          likes: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`✅ Found ${partners.length} partners\n`)
  
  for (const partner of partners) {
    // Calculate average rating
    const ratings = await prisma.partnerRating.findMany({
      where: { partnerId: partner.id }
    })
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0
    
    console.log(`📌 ${partner.name}`)
    console.log(`   - Status: ${partner.isActive ? '✅ Active' : '❌ Inactive'}`)
    console.log(`   - Views: ${partner.viewCount.toLocaleString()}`)
    console.log(`   - Ratings: ${partner._count.ratings} (avg: ${avgRating.toFixed(1)}⭐)`)
    console.log(`   - Comments: ${partner._count.comments}`)
    console.log(`   - Likes: ${partner._count.likes}`)
    console.log(`   - Website: ${partner.websiteUrl || 'N/A'}`)
    console.log('')
  }
  
  // Sample comments
  console.log('💬 Recent Comments:')
  const recentComments = await prisma.partnerComment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          username: true,
          level: true
        }
      },
      partner: {
        select: {
          name: true
        }
      }
    }
  })
  
  recentComments.forEach(comment => {
    console.log(`- "${comment.content}"`)
    console.log(`  by ${comment.user.username} (Lv.${comment.user.level}) on ${comment.partner.name}`)
    console.log('')
  })
  
  // Overall statistics
  const totalRatings = await prisma.partnerRating.count()
  const totalComments = await prisma.partnerComment.count()
  const totalLikes = await prisma.partnerLike.count()
  
  console.log('📊 Overall Partner Statistics:')
  console.log(`- Total Ratings: ${totalRatings}`)
  console.log(`- Total Comments: ${totalComments}`)
  console.log(`- Total Likes: ${totalLikes}`)
}

verifyPartnerData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })