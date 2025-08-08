import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkTeams() {
  console.log('🔍 Checking teams in production database...\n');
  
  try {
    // Get all teams with their sports
    const teams = await prodPrisma.team.findMany({
      include: {
        sport: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`Found ${teams.length} teams\n`);
    
    // Group by sport
    const bySport = new Map<string, typeof teams>();
    teams.forEach(team => {
      const sportName = team.sport?.nameEn || 'Unknown';
      if (!bySport.has(sportName)) {
        bySport.set(sportName, []);
      }
      bySport.get(sportName)!.push(team);
    });
    
    // Show teams by sport
    for (const [sport, sportTeams] of bySport) {
      console.log(`\n${sport} Teams (${sportTeams.length}):`);
      sportTeams.forEach(team => {
        console.log(`  ID ${team.id}: ${team.nameKo} (${team.nameEn})`);
      });
    }
    
    // Show just football teams for easy reference
    const footballTeams = teams.filter(t => t.sport?.nameEn === 'Soccer');
    console.log('\n📋 Football/Soccer Team IDs for reference:');
    footballTeams.forEach(team => {
      console.log(`  ${team.id}: ${team.nameEn}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkTeams();