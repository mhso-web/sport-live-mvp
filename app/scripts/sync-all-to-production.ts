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

async function syncAllToProduction() {
  console.log('🚀 Syncing all updated data to production...\n');
  
  try {
    // 1. Sync all matches (with updated dates)
    console.log('📅 Syncing matches...');
    const localMatches = await localPrisma.match.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Clear production matches first to ensure clean state
    await prodPrisma.match.deleteMany({});
    console.log('  ✅ Cleared production matches');
    
    // Get sports, leagues, and teams mappings
    const sportMap = new Map();
    const leagueMap = new Map();
    const teamMap = new Map();
    
    const localSports = await localPrisma.sport.findMany();
    const prodSports = await prodPrisma.sport.findMany();
    
    localSports.forEach(ls => {
      const ps = prodSports.find(p => p.slug === ls.slug);
      if (ps) sportMap.set(ls.id, ps.id);
    });
    
    const localLeagues = await localPrisma.league.findMany();
    const prodLeagues = await prodPrisma.league.findMany();
    
    localLeagues.forEach(ll => {
      const pl = prodLeagues.find(p => p.slug === ll.slug);
      if (pl) leagueMap.set(ll.id, pl.id);
    });
    
    const localTeams = await localPrisma.team.findMany();
    const prodTeams = await prodPrisma.team.findMany();
    
    localTeams.forEach(lt => {
      const pt = prodTeams.find(p => p.slug === lt.slug);
      if (pt) teamMap.set(lt.id, pt.id);
    });
    
    // Create all matches in production
    let matchCount = 0;
    for (const match of localMatches) {
      await prodPrisma.match.create({
        data: {
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
          currentMinute: match.currentMinute,
          venue: match.venue,
          country: match.country,
          streamUrl: match.streamUrl,
          metadata: match.metadata,
          sportId: match.sportId ? sportMap.get(match.sportId) || null : null,
          leagueId: match.leagueId ? leagueMap.get(match.leagueId) || null : null,
          homeTeamId: match.homeTeamId ? teamMap.get(match.homeTeamId) || null : null,
          awayTeamId: match.awayTeamId ? teamMap.get(match.awayTeamId) || null : null
        }
      });
      matchCount++;
    }
    console.log(`  ✅ Synced ${matchCount} matches`);
    
    // 2. Sync SportAnalysis data
    console.log('\n📊 Syncing analysis data...');
    const localAnalyses = await localPrisma.sportAnalysis.findMany();
    
    // Get admin user in production
    const prodAdminUser = await prodPrisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!prodAdminUser) {
      console.log('  ❌ No admin user in production, skipping analysis sync');
    } else {
      let analysisCount = 0;
      
      for (const analysis of localAnalyses) {
        // Check if already exists
        const existing = await prodPrisma.sportAnalysis.findUnique({
          where: { slug: analysis.slug }
        });
        
        if (!existing) {
          await prodPrisma.sportAnalysis.create({
            data: {
              authorId: prodAdminUser.id,
              matchDate: analysis.matchDate,
              sportType: analysis.sportType,
              league: analysis.league,
              competition: analysis.competition,
              homeTeam: analysis.homeTeam,
              awayTeam: analysis.awayTeam,
              title: analysis.title,
              slug: analysis.slug,
              metaDescription: analysis.metaDescription,
              metaKeywords: analysis.metaKeywords,
              homeFormation: analysis.homeFormation,
              awayFormation: analysis.awayFormation,
              homeAnalysis: analysis.homeAnalysis,
              awayAnalysis: analysis.awayAnalysis,
              tacticalAnalysis: analysis.tacticalAnalysis,
              keyPlayers: analysis.keyPlayers,
              injuryInfo: analysis.injuryInfo,
              headToHead: analysis.headToHead,
              recentForm: analysis.recentForm,
              predictionSummary: analysis.predictionSummary,
              confidenceLevel: analysis.confidenceLevel,
              views: analysis.views,
              likes: analysis.likes,
              status: analysis.status,
              isPublished: analysis.isPublished,
              publishedAt: analysis.publishedAt,
              isPinned: analysis.isPinned
            }
          });
          analysisCount++;
          console.log(`  ✅ Created analysis: ${analysis.title}`);
        } else {
          console.log(`  ⏭️  Analysis already exists: ${analysis.title}`);
        }
      }
      console.log(`  📊 Total analyses created: ${analysisCount}`);
    }
    
    // 3. Verify final counts
    console.log('\n📊 Production Database Final Counts:');
    const finalMatches = await prodPrisma.match.count();
    const finalAnalyses = await prodPrisma.sportAnalysis.count();
    const todayMatches = await prodPrisma.match.count({
      where: {
        scheduledTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });
    const aug15Matches = await prodPrisma.match.count({
      where: {
        scheduledTime: {
          gte: new Date('2025-08-15T00:00:00Z'),
          lt: new Date('2025-08-16T00:00:00Z')
        }
      }
    });
    const aug16Matches = await prodPrisma.match.count({
      where: {
        scheduledTime: {
          gte: new Date('2025-08-16T00:00:00Z'),
          lt: new Date('2025-08-17T00:00:00Z')
        }
      }
    });
    
    console.log(`  Total matches: ${finalMatches}`);
    console.log(`  Total analyses: ${finalAnalyses}`);
    console.log(`  Today's matches: ${todayMatches}`);
    console.log(`  August 15 matches: ${aug15Matches}`);
    console.log(`  August 16 matches: ${aug16Matches}`);
    
    console.log('\n✨ All data synced to production successfully!');
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncAllToProduction();