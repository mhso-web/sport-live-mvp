import { PrismaClient } from '@prisma/client';

// Production database client  
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL || 
        "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkProductionMatches() {
  console.log('🔍 Checking production match data...\n');
  
  try {
    // 1. Check matches with includes
    const matches = await prodPrisma.match.findMany({
      include: {
        sport: true,
        leagueRef: true,
        homeTeamRef: true,
        awayTeamRef: true,
      },
      orderBy: { scheduledTime: 'asc' },
      take: 10
    });
    
    console.log(`Found ${matches.length} matches in production\n`);
    
    // 2. Check for null references
    let nullSports = 0;
    let nullLeagues = 0;
    let nullHomeTeams = 0;
    let nullAwayTeams = 0;
    
    matches.forEach((match, index) => {
      console.log(`Match ${index + 1} (ID: ${match.id}):`);
      console.log(`  Scheduled: ${match.scheduledTime.toISOString()}`);
      console.log(`  Sport: ${match.sport ? `✅ ${match.sport.nameKo}` : '❌ NULL'}`);
      console.log(`  League: ${match.leagueRef ? `✅ ${match.leagueRef.nameKo}` : '❌ NULL'}`);
      console.log(`  Home Team: ${match.homeTeamRef ? `✅ ${match.homeTeamRef.nameKo}` : '❌ NULL'}`);
      console.log(`  Away Team: ${match.awayTeamRef ? `✅ ${match.awayTeamRef.nameKo}` : '❌ NULL'}`);
      console.log(`  Status: ${match.status}`);
      console.log('');
      
      if (!match.sport) nullSports++;
      if (!match.leagueRef) nullLeagues++;
      if (!match.homeTeamRef) nullHomeTeams++;
      if (!match.awayTeamRef) nullAwayTeams++;
    });
    
    console.log('📊 Summary:');
    console.log(`  Matches with NULL sport: ${nullSports}`);
    console.log(`  Matches with NULL league: ${nullLeagues}`);
    console.log(`  Matches with NULL home team: ${nullHomeTeams}`);
    console.log(`  Matches with NULL away team: ${nullAwayTeams}`);
    
    // 3. Check if reference tables have data
    console.log('\n📋 Reference Tables Status:');
    const sportCount = await prodPrisma.sport.count();
    const leagueCount = await prodPrisma.league.count();
    const teamCount = await prodPrisma.team.count();
    
    console.log(`  Sports: ${sportCount} records`);
    console.log(`  Leagues: ${leagueCount} records`);
    console.log(`  Teams: ${teamCount} records`);
    
    if (sportCount > 0) {
      const sports = await prodPrisma.sport.findMany({ take: 3 });
      console.log('\n  Sample Sports:');
      sports.forEach(s => console.log(`    - ${s.nameKo} (ID: ${s.id})`));
    }
    
    if (leagueCount > 0) {
      const leagues = await prodPrisma.league.findMany({ take: 3 });
      console.log('\n  Sample Leagues:');
      leagues.forEach(l => console.log(`    - ${l.nameKo} (ID: ${l.id})`));
    }
    
    if (teamCount > 0) {
      const teams = await prodPrisma.team.findMany({ take: 5 });
      console.log('\n  Sample Teams:');
      teams.forEach(t => console.log(`    - ${t.nameKo} (ID: ${t.id})`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkProductionMatches();