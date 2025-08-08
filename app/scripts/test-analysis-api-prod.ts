import { PrismaClient } from '@prisma/client';

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://692715389a9949a10592597d04e08da3100cff9bd85bba795edc91dfbfe79cc2:sk_UUR2boWzFTwUb9kN--gpB@db.prisma.io:5432/?sslmode=require"
    }
  }
});

async function testAnalysisAPI() {
  console.log('🔍 Testing Analysis API logic directly...\n');
  
  try {
    // Simulate the exact query from AnalysisService.getList
    const where = {
      isPublished: true,
      status: 'PUBLISHED' as const,
    };
    
    console.log('Query conditions:', JSON.stringify(where, null, 2));
    
    const [analyses, total] = await Promise.all([
      prodPrisma.sportAnalysis.findMany({
        where,
        orderBy: { matchDate: 'desc' },
        skip: 0,
        take: 20,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              level: true,
              analystProfile: true,
            },
          },
          _count: {
            select: {
              analysisLikes: true,
              comments: true,
              predictions: true,
            },
          },
        },
      }),
      prodPrisma.sportAnalysis.count({ where }),
    ]);
    
    console.log(`\n✅ Query successful!`);
    console.log(`Total matching analyses: ${total}`);
    console.log(`Fetched analyses: ${analyses.length}`);
    
    if (analyses.length > 0) {
      console.log('\nFirst 3 analyses:');
      analyses.slice(0, 3).forEach((analysis, i) => {
        console.log(`\n${i + 1}. ${analysis.title}`);
        console.log(`   Slug: ${analysis.slug}`);
        console.log(`   Match Date: ${analysis.matchDate.toISOString()}`);
        console.log(`   Author: ${analysis.author?.username || 'Unknown'}`);
        console.log(`   Views: ${analysis.views}, Likes: ${analysis.likes}`);
        console.log(`   Comments: ${analysis._count.comments}, Predictions: ${analysis._count.predictions}`);
      });
    }
    
    // Now test the actual API endpoint
    console.log('\n\n📡 Testing actual API endpoint...');
    const apiUrl = 'https://foul-tv.com/api/analysis';
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    try {
      const data = JSON.parse(responseText);
      console.log(`Response:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`Raw response: ${responseText.substring(0, 500)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the test
testAnalysisAPI();