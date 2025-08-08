import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const partners = await prisma.partner.count();
    const posts = await prisma.post.count();
    const matches = await prisma.match.count();
    const analyses = await prisma.sportAnalysis.count();
    const users = await prisma.user.count();
    const categories = await prisma.boardCategory.count();
    
    console.log('===== Local Database Data Count =====');
    console.log('Partners:', partners);
    console.log('Posts:', posts);
    console.log('Matches:', matches);
    console.log('Sport Analyses:', analyses);
    console.log('Users:', users);
    console.log('Board Categories:', categories);
    console.log('=====================================');
    
    // Get recent partners
    const recentPartners = await prisma.partner.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, isActive: true }
    });
    
    console.log('\nRecent Partners:');
    recentPartners.forEach(p => {
      console.log(`- ${p.name} (Active: ${p.isActive})`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();