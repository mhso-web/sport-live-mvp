import { PrismaClient } from '@prisma/client';

// Local database client
const localPrisma = new PrismaClient();

// Production database client  
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

async function syncMatches() {
  console.log('🚀 Syncing updated matches to production...\n');
  
  try {
    // Get today's date
    const today = new Date();
    const todayStart = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    todayStart.setHours(0, 0, 0, 0);
    
    // Get matches for today and tomorrow
    const nextTwoDays = new Date(todayStart);
    nextTwoDays.setDate(nextTwoDays.getDate() + 2);
    
    const recentMatches = await localPrisma.match.findMany({
      where: {
        scheduledTime: {
          gte: todayStart,
          lt: nextTwoDays
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });
    
    console.log(`Found ${recentMatches.length} matches to sync`);
    
    let updated = 0;
    let created = 0;
    
    for (const match of recentMatches) {
      try {
        // Check if match exists in production
        const existingMatch = await prodPrisma.match.findFirst({
          where: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam
          }
        });
        
        // Get related IDs if they exist
        let sportId = null;
        let leagueId = null;
        let homeTeamId = null;
        let awayTeamId = null;
        
        if (match.sportId) {
          const localSport = await localPrisma.sport.findUnique({ where: { id: match.sportId }});
          if (localSport) {
            const prodSport = await prodPrisma.sport.findUnique({ where: { slug: localSport.slug }});
            sportId = prodSport?.id || null;
          }
        }
        
        if (match.leagueId && sportId) {
          const localLeague = await localPrisma.league.findUnique({ where: { id: match.leagueId }});
          if (localLeague) {
            const prodLeague = await prodPrisma.league.findFirst({
              where: { slug: localLeague.slug, sportId: sportId }
            });
            leagueId = prodLeague?.id || null;
          }
        }
        
        if (match.homeTeamId && sportId) {
          const localTeam = await localPrisma.team.findUnique({ where: { id: match.homeTeamId }});
          if (localTeam) {
            const prodTeam = await prodPrisma.team.findFirst({
              where: { slug: localTeam.slug, sportId: sportId }
            });
            homeTeamId = prodTeam?.id || null;
          }
        }
        
        if (match.awayTeamId && sportId) {
          const localTeam = await localPrisma.team.findUnique({ where: { id: match.awayTeamId }});
          if (localTeam) {
            const prodTeam = await prodPrisma.team.findFirst({
              where: { slug: localTeam.slug, sportId: sportId }
            });
            awayTeamId = prodTeam?.id || null;
          }
        }
        
        const matchData = {
          sportType: match.sportType,
          league: match.league,
          competition: match.competition,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeTeamLogo: match.homeTeamLogo,
          awayTeamLogo: match.awayTeamLogo,
          scheduledTime: match.scheduledTime,
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          venue: match.venue,
          country: match.country,
          streamUrl: match.streamUrl,
          metadata: match.metadata,
          sportId: sportId,
          leagueId: leagueId,
          homeTeamId: homeTeamId,
          awayTeamId: awayTeamId
        };
        
        if (existingMatch) {
          // Update existing match
          await prodPrisma.match.update({
            where: { id: existingMatch.id },
            data: matchData
          });
          console.log(`✅ Updated: ${match.homeTeam} vs ${match.awayTeam} - ${match.scheduledTime.toLocaleString('ko-KR')}`);
          updated++;
        } else {
          // Create new match
          await prodPrisma.match.create({
            data: matchData
          });
          console.log(`✅ Created: ${match.homeTeam} vs ${match.awayTeam} - ${match.scheduledTime.toLocaleString('ko-KR')}`);
          created++;
        }
      } catch (error: any) {
        console.log(`⚠️  Error syncing match ${match.homeTeam} vs ${match.awayTeam}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Sync Summary:`);
    console.log(`  Updated: ${updated} matches`);
    console.log(`  Created: ${created} matches`);
    
    // Verify production data
    const prodTodayMatches = await prodPrisma.match.count({
      where: {
        scheduledTime: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    const prodTomorrowMatches = await prodPrisma.match.count({
      where: {
        scheduledTime: {
          gte: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          lt: new Date(todayStart.getTime() + 48 * 60 * 60 * 1000)
        }
      }
    });
    
    console.log(`\n📊 Production Database Status:`);
    console.log(`  Today's matches: ${prodTodayMatches}`);
    console.log(`  Tomorrow's matches: ${prodTomorrowMatches}`);
    
    console.log('\n✨ Match sync completed!');
    
  } catch (error) {
    console.error('❌ Error during match sync:', error);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncMatches();