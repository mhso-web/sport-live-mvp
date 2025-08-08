import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Production database client  
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL || 
        "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function fixAnalysisDatesForHome() {
  console.log('🔧 Fixing analysis dates for home page display...\n');
  
  try {
    // 1. Check current analysis dates
    console.log('📊 Checking current analysis dates...');
    const analyses = await prodPrisma.sportAnalysis.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        matchDate: true,
        homeTeam: true,
        awayTeam: true,
        isPublished: true,
        status: true,
      },
      orderBy: { matchDate: 'asc' }
    });
    
    console.log(`Found ${analyses.length} analyses in production\n`);
    
    // Group by date
    const byDate = new Map<string, typeof analyses>();
    analyses.forEach(analysis => {
      const dateKey = analysis.matchDate.toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(analysis);
    });
    
    console.log('Current distribution by date:');
    for (const [date, items] of byDate) {
      console.log(`  ${date}: ${items.length} analyses`);
    }
    
    // 2. Update some analyses to have today's date for home page
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    
    console.log(`\n📅 Setting some analyses to today (${today.toISOString().split('T')[0]}) for home page...`);
    
    // Select analyses to show on home page (take 6 for variety)
    const analysesToUpdate = [
      // Priority matches
      analyses.find(a => a.slug.includes('liverpool-vs-bournemouth')),
      analyses.find(a => a.slug.includes('aston-villa-vs-newcastle')),
      analyses.find(a => a.slug.includes('tottenham')),
      analyses.find(a => a.slug.includes('brighton')),
      analyses.find(a => a.slug.includes('manchester-city')),
      analyses.find(a => a.slug.includes('chelsea')),
    ].filter(Boolean).slice(0, 6);
    
    console.log(`\nUpdating ${analysesToUpdate.length} analyses to today's date:`);
    
    for (const analysis of analysesToUpdate) {
      if (analysis) {
        await prodPrisma.sportAnalysis.update({
          where: { id: analysis.id },
          data: { 
            matchDate: today,
            isPublished: true,
            status: 'PUBLISHED'
          }
        });
        console.log(`  ✅ Updated: ${analysis.title}`);
      }
    }
    
    // 3. Verify the changes
    console.log('\n📊 Verifying changes...');
    const todayAnalyses = await prodPrisma.sportAnalysis.count({
      where: {
        matchDate: {
          gte: new Date(today.toISOString().split('T')[0] + 'T00:00:00Z'),
          lt: new Date(today.toISOString().split('T')[0] + 'T23:59:59Z')
        },
        isPublished: true,
        status: 'PUBLISHED'
      }
    });
    
    console.log(`\n✨ Success! ${todayAnalyses} analyses are now set for today and will appear on the home page.`);
    
    // 4. Also update local database for consistency
    console.log('\n🔄 Syncing changes to local database...');
    
    const localAnalyses = await prisma.sportAnalysis.findMany({
      select: { id: true, slug: true }
    });
    
    for (const analysis of analysesToUpdate) {
      if (analysis) {
        const localMatch = localAnalyses.find(la => la.slug === analysis.slug);
        if (localMatch) {
          await prisma.sportAnalysis.update({
            where: { id: localMatch.id },
            data: { 
              matchDate: today,
              isPublished: true,
              status: 'PUBLISHED'
            }
          });
        }
      }
    }
    
    console.log('✅ Local database synced');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the fix
fixAnalysisDatesForHome();