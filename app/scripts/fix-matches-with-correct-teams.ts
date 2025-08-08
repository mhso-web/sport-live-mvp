import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function fixMatchesWithCorrectTeams() {
  console.log('🔧 Fixing matches with correct football teams...\n');
  
  try {
    // Wait for connections to clear
    console.log('Waiting for connections to clear...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Define proper match updates using only football team IDs
    // Football team IDs: 1-7, 11-14
    const matchUpdates = [
      // Today's matches (Aug 8)
      { id: 34, homeTeamId: 1, awayTeamId: 2 },  // Liverpool vs Man United
      { id: 35, homeTeamId: 3, awayTeamId: 4 },  // Chelsea vs Arsenal
      { id: 36, homeTeamId: 5, awayTeamId: 12 }, // Tottenham vs Aston Villa
      // Aug 15 match
      { id: 29, homeTeamId: 1, awayTeamId: 13 }, // Liverpool vs Newcastle
      // Aug 16 matches
      { id: 31, homeTeamId: 2, awayTeamId: 14 }, // Man United vs Leeds
      { id: 32, homeTeamId: 12, awayTeamId: 13 }, // Aston Villa vs Newcastle
      { id: 30, homeTeamId: 4, awayTeamId: 3 },  // Arsenal vs Chelsea
      { id: 33, homeTeamId: 5, awayTeamId: 1 },  // Tottenham vs Liverpool
      // Aug 22-23 matches
      { id: 37, homeTeamId: 13, awayTeamId: 14 }, // Newcastle vs Leeds
      { id: 38, homeTeamId: 3, awayTeamId: 2 },  // Chelsea vs Man United
    ];
    
    console.log(`Updating ${matchUpdates.length} matches with correct teams...\n`);
    
    // Update each match with raw SQL
    for (const update of matchUpdates) {
      const query = `UPDATE matches SET home_team_id = ${update.homeTeamId}, away_team_id = ${update.awayTeamId} WHERE id = ${update.id}`;
      await prodPrisma.$executeRawUnsafe(query);
      console.log(`✅ Updated match ID ${update.id}`);
    }
    
    console.log('\n📊 Verifying updates...\n');
    
    // Verify the updates
    const matches = await prodPrisma.$queryRaw`
      SELECT 
        m.id,
        m."scheduled_time",
        ht."name_ko" as "homeTeam",
        at."name_ko" as "awayTeam",
        l."name_ko" as "league"
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at ON m.away_team_id = at.id
      LEFT JOIN leagues l ON m.league_id = l.id
      WHERE m.id IN (34, 35, 36, 29, 31, 32, 30, 33, 37, 38)
      ORDER BY m."scheduled_time"
    `;
    
    console.log('Updated matches:');
    (matches as any[]).forEach(match => {
      const date = new Date(match.scheduled_time);
      console.log(`  ${date.toLocaleDateString()}: ${match.homeTeam} vs ${match.awayTeam}`);
    });
    
    console.log('\n✨ Matches fixed with correct football teams!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the fix
fixMatchesWithCorrectTeams();