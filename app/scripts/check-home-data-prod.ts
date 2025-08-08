import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkHomeData() {
  console.log('🔍 Checking home page data from production...\n');
  
  try {
    // Get today's matches like the home service does
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const matches = await prodPrisma.match.findMany({
      where: {
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      take: 10,
    });
    
    console.log(`Found ${matches.length} matches for today (${today.toLocaleDateString()}):\n`);
    
    matches.forEach((match, index) => {
      console.log(`Match ${index + 1}:`);
      console.log(`  Time: ${match.scheduledTime.toLocaleTimeString()}`);
      console.log(`  Sport: ${match.sport?.nameKo || 'NULL'}`);
      console.log(`  League: ${match.leagueRef?.nameKo || 'NULL'}`);
      console.log(`  Home: ${match.homeTeamRef?.nameKo || 'NULL'}`);
      console.log(`  Away: ${match.awayTeamRef?.nameKo || 'NULL'}`);
      console.log(`  Status: ${match.status}`);
      console.log('');
    });
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found for today.');
      console.log('Checking all matches to see available dates...\n');
      
      const allMatches = await prodPrisma.match.findMany({
        select: {
          id: true,
          scheduledTime: true,
          homeTeamRef: { select: { nameKo: true } },
          awayTeamRef: { select: { nameKo: true } },
        },
        orderBy: { scheduledTime: 'asc' },
        take: 5
      });
      
      console.log('Next 5 matches in database:');
      allMatches.forEach(m => {
        console.log(`  ${m.scheduledTime.toLocaleDateString()}: ${m.homeTeamRef?.nameKo || 'NULL'} vs ${m.awayTeamRef?.nameKo || 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkHomeData();