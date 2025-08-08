import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function checkAnalysisStatus() {
  console.log('🔍 Checking SportAnalysis status in production...\n');
  
  try {
    // Get all analyses
    const allAnalyses = await prodPrisma.sportAnalysis.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        status: true,
        publishedAt: true,
        matchDate: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${allAnalyses.length} total analyses\n`);
    
    // Count by status
    const statusCounts = {
      published: 0,
      draft: 0,
      unpublished: 0
    };
    
    const publishedAnalyses: typeof allAnalyses = [];
    const unpublishedAnalyses: typeof allAnalyses = [];
    
    allAnalyses.forEach(analysis => {
      console.log(`ID: ${analysis.id}, Slug: ${analysis.slug}`);
      console.log(`  Title: ${analysis.title}`);
      console.log(`  isPublished: ${analysis.isPublished}, status: ${analysis.status}`);
      console.log(`  Match Date: ${analysis.matchDate?.toISOString()}`);
      console.log(`  Published At: ${analysis.publishedAt?.toISOString() || 'NULL'}`);
      console.log('');
      
      if (analysis.isPublished && analysis.status === 'PUBLISHED') {
        statusCounts.published++;
        publishedAnalyses.push(analysis);
      } else if (analysis.status === 'DRAFT') {
        statusCounts.draft++;
        unpublishedAnalyses.push(analysis);
      } else {
        statusCounts.unpublished++;
        unpublishedAnalyses.push(analysis);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`  Published (isPublished=true & status=PUBLISHED): ${statusCounts.published}`);
    console.log(`  Draft: ${statusCounts.draft}`);
    console.log(`  Unpublished: ${statusCounts.unpublished}`);
    
    if (publishedAnalyses.length === 0) {
      console.log('\n⚠️  WARNING: No analyses are properly published!');
      console.log('   The API filters for isPublished=true AND status=PUBLISHED');
      console.log('   This is why the /analysis page shows no data.');
    }
    
    // Check today's analyses specifically
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    const todayAnalyses = await prodPrisma.sportAnalysis.findMany({
      where: {
        matchDate: {
          gte: today,
          lt: tomorrow,
        }
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
        status: true,
      }
    });
    
    console.log(`\n📅 Today's analyses (${today.toISOString().split('T')[0]}): ${todayAnalyses.length}`);
    todayAnalyses.forEach(analysis => {
      console.log(`  - ${analysis.title}: isPublished=${analysis.isPublished}, status=${analysis.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkAnalysisStatus();