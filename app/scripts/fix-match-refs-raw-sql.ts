import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function fixMatchReferencesWithSQL() {
  console.log('🔧 Fixing match references using raw SQL...\n');
  
  try {
    // Wait for any existing connections to clear
    console.log('Waiting for connections to clear...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update all matches at once with raw SQL (using correct column names)
    const updateQueries = [
      // Today's matches
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 1, away_team_id = 2 WHERE id = 34`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 3, away_team_id = 4 WHERE id = 35`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 5, away_team_id = 6 WHERE id = 36`,
      // Aug 15
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 1, away_team_id = 10 WHERE id = 29`,
      // Aug 16
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 2, away_team_id = 7 WHERE id = 31`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 8, away_team_id = 7 WHERE id = 32`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 4, away_team_id = 9 WHERE id = 30`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 5, away_team_id = 11 WHERE id = 33`,
      // Aug 22-23
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 6, away_team_id = 1 WHERE id = 37`,
      `UPDATE matches SET sport_id = 1, league_id = 1, home_team_id = 3, away_team_id = 2 WHERE id = 38`,
    ];
    
    console.log(`Executing ${updateQueries.length} update queries...\n`);
    
    for (let i = 0; i < updateQueries.length; i++) {
      await prodPrisma.$executeRawUnsafe(updateQueries[i]);
      console.log(`✅ Query ${i + 1} executed`);
    }
    
    console.log('\n📊 Verifying updates...\n');
    
    // Verify with a select query
    const matches = await prodPrisma.$queryRaw`
      SELECT 
        m.id,
        m."scheduled_time",
        ht."name_ko" as "homeTeam",
        at."name_ko" as "awayTeam",
        l."name_ko" as "league",
        s."name_ko" as "sport"
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at ON m.away_team_id = at.id
      LEFT JOIN leagues l ON m.league_id = l.id
      LEFT JOIN sports s ON m.sport_id = s.id
      WHERE m.id IN (34, 35, 36, 29, 31, 32, 30, 33, 37, 38)
      ORDER BY m."scheduled_time"
    `;
    
    console.log('Updated matches:');
    (matches as any[]).forEach(match => {
      console.log(`  ${match.homeTeam} vs ${match.awayTeam} (${match.league})`);
    });
    
    console.log('\n✨ Match references fixed successfully with raw SQL!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the fix
fixMatchReferencesWithSQL();