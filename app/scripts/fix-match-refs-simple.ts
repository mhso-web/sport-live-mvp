import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function fixMatchReferences() {
  console.log('🔧 Fixing match references with simple approach...\n');
  
  try {
    // Wait a bit for connections to clear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Define match updates with hardcoded IDs from our earlier check
    const matchUpdates = [
      // Today's matches (IDs: 34, 35, 36)
      { id: 34, sportId: 1, leagueId: 1, homeTeamId: 1, awayTeamId: 2 }, // Liverpool vs Man United
      { id: 35, sportId: 1, leagueId: 1, homeTeamId: 3, awayTeamId: 4 }, // Chelsea vs Arsenal
      { id: 36, sportId: 1, leagueId: 1, homeTeamId: 5, awayTeamId: 6 }, // Tottenham vs Man City
      // Aug 15 match (ID: 29)
      { id: 29, sportId: 1, leagueId: 1, homeTeamId: 1, awayTeamId: 10 }, // Liverpool vs Bournemouth
      // Aug 16 matches (IDs: 31, 32, 30, 33)
      { id: 31, sportId: 1, leagueId: 1, homeTeamId: 2, awayTeamId: 7 }, // Man United vs Newcastle
      { id: 32, sportId: 1, leagueId: 1, homeTeamId: 8, awayTeamId: 7 }, // Aston Villa vs Newcastle
      { id: 30, sportId: 1, leagueId: 1, homeTeamId: 4, awayTeamId: 9 }, // Arsenal vs Brighton
      { id: 33, sportId: 1, leagueId: 1, homeTeamId: 5, awayTeamId: 11 }, // Tottenham vs Everton
      // Aug 22-23 matches (IDs: 37, 38)
      { id: 37, sportId: 1, leagueId: 1, homeTeamId: 6, awayTeamId: 1 }, // Man City vs Liverpool
      { id: 38, sportId: 1, leagueId: 1, homeTeamId: 3, awayTeamId: 2 }, // Chelsea vs Man United
    ];
    
    console.log(`Updating ${matchUpdates.length} matches...\n`);
    
    // Update each match
    for (const update of matchUpdates) {
      await prodPrisma.match.update({
        where: { id: update.id },
        data: {
          sportId: update.sportId,
          leagueId: update.leagueId,
          homeTeamId: update.homeTeamId,
          awayTeamId: update.awayTeamId,
        }
      });
      console.log(`✅ Updated match ID ${update.id}`);
    }
    
    console.log('\n📊 Verifying updates...\n');
    
    // Verify the updates
    const verifyMatches = await prodPrisma.match.findMany({
      where: {
        id: { in: matchUpdates.map(m => m.id) }
      },
      include: {
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
      },
      orderBy: { scheduledTime: 'asc' }
    });
    
    verifyMatches.forEach(match => {
      console.log(`Match ${match.id}: ${match.homeTeamRef?.nameKo} vs ${match.awayTeamRef?.nameKo}`);
      console.log(`  ${match.leagueRef?.nameKo} | ${match.scheduledTime.toLocaleDateString()}`);
    });
    
    console.log('\n✨ Match references fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the fix
fixMatchReferences();