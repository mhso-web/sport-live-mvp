import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkAllMatches() {
  console.log('🔍 Checking ALL matches in production...\n');
  
  try {
    // Get ALL matches without any date filter
    const matches = await prodPrisma.match.findMany({
      include: {
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      }
    });
    
    console.log(`Found ${matches.length} total matches in production:\n`);
    
    // Group by date
    const byDate = new Map<string, typeof matches>();
    matches.forEach(match => {
      const dateKey = match.scheduledTime.toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(match);
    });
    
    console.log('Matches by date:');
    for (const [date, dateMatches] of byDate) {
      console.log(`\n${date}: ${dateMatches.length} matches`);
      dateMatches.forEach(match => {
        const time = match.scheduledTime.toLocaleTimeString();
        const home = match.homeTeamRef?.nameKo || 'NULL';
        const away = match.awayTeamRef?.nameKo || 'NULL';
        console.log(`  ${time}: ${home} vs ${away} (ID: ${match.id}, Status: ${match.status})`);
      });
    }
    
    // Also check timezone info
    console.log('\n📅 Timezone Information:');
    console.log(`  Server time: ${new Date().toISOString()}`);
    console.log(`  Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    
    if (matches.length > 0) {
      const firstMatch = matches[0];
      console.log(`\n  First match raw time: ${firstMatch.scheduledTime.toISOString()}`);
      console.log(`  First match local time: ${firstMatch.scheduledTime.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkAllMatches();