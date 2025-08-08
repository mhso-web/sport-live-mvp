#!/usr/bin/env tsx
/**
 * Test script for SEO URL generation
 * Creates a test analysis with the new hierarchical URL structure
 */

import { PrismaClient } from '@prisma/client';
import { AnalysisServiceSEO } from '../lib/services/analysisService.seo';
import { generateAnalysisSeoUrl } from '../lib/utils/seoUrl';

const prisma = new PrismaClient();

async function testSeoUrlGeneration() {
  try {
    console.log('🚀 Testing SEO URL generation...\n');
    
    // 1. Find or create a test user
    let testUser = await prisma.user.findUnique({
      where: { username: 'seo_test_user' },
      include: { analystProfile: true }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          username: 'seo_test_user',
          email: 'seo_test@example.com',
          passwordHash: 'test_hash',
          role: 'ANALYST',
          bio: 'Test user for SEO URL generation'
        }
      });
    }
    
    // Create analyst profile if it doesn't exist
    if (!testUser.analystProfile) {
      await prisma.analystProfile.create({
        data: {
          userId: testUser.id,
          displayName: 'SEO Test Analyst',
          specialties: ['Soccer', 'Premier League'],
          description: 'Test analyst for SEO URL testing',
          experience: '5 years of sports analysis experience',
          isVerified: true,
          averageAccuracy: 85.5,
          totalPredictions: 100,
          correctPredictions: 85,
          totalViews: 1000,
          profileImage: 'https://example.com/avatar.jpg'
        }
      });
    }
    
    // 2. Create test analysis data
    const testAnalysisData = {
      matchDate: '2025-08-17T15:00:00Z',
      sportType: 'SOCCER',
      league: 'Premier League',
      competition: null,
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester United',
      title: 'Liverpool vs Manchester United - Premier League Clash Analysis',
      metaDescription: 'In-depth analysis of the Liverpool vs Manchester United match in the Premier League',
      metaKeywords: ['Liverpool', 'Manchester United', 'Premier League', 'Soccer', 'Match Analysis'],
      homeFormation: '4-3-3',
      awayFormation: '4-2-3-1',
      homeAnalysis: 'Liverpool has been in excellent form, winning their last 5 matches...',
      awayAnalysis: 'Manchester United showing signs of improvement under the new manager...',
      tacticalAnalysis: 'This match will be a tactical battle between two contrasting styles...',
      keyPlayers: {
        home: ['Salah', 'Van Dijk', 'Alisson'],
        away: ['Bruno Fernandes', 'Rashford', 'Casemiro']
      },
      injuryInfo: {
        home: ['Jota - Doubtful'],
        away: ['Martinez - Out']
      },
      headToHead: {
        lastMeetings: [
          { date: '2025-03-10', result: 'Liverpool 2-1 Man United' },
          { date: '2024-12-17', result: 'Man United 0-0 Liverpool' }
        ]
      },
      recentForm: {
        home: ['W', 'W', 'W', 'W', 'W'],
        away: ['W', 'D', 'W', 'L', 'W']
      },
      predictionSummary: 'Liverpool\'s home advantage and current form make them favorites...',
      confidenceLevel: 4,
      predictions: [
        {
          betType: 'MATCH_RESULT',
          prediction: 'Liverpool Win',
          odds: 1.85,
          stake: 3,
          reasoning: 'Liverpool\'s home record and current form strongly favor them'
        },
        {
          betType: 'OVER_UNDER',
          prediction: 'Over 2.5 Goals',
          odds: 1.75,
          stake: 2,
          reasoning: 'Both teams have attacking firepower and recent meetings have been high-scoring'
        }
      ]
    };
    
    // 3. Create analysis with SEO URL
    console.log('📝 Creating analysis with SEO URL...');
    const analysis = await AnalysisServiceSEO.createWithSeoUrl(
      testAnalysisData as any,
      testUser.id
    );
    
    // 4. Display results
    console.log('\n✅ Analysis created successfully!\n');
    console.log('📊 Analysis Details:');
    console.log(`   ID: ${analysis.id}`);
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Old Slug: ${analysis.slug}`);
    console.log(`   SEO Slug: ${analysis.seoSlug}`);
    console.log(`   Full SEO URL: ${analysis.seoUrl}`);
    
    // 5. Verify the URL structure
    const expectedUrl = generateAnalysisSeoUrl({
      sport: { slug: 'soccer' },
      league: { slug: 'premier-league' },
      matchDate: testAnalysisData.matchDate,
      homeTeam: { slug: 'liverpool' },
      awayTeam: { slug: 'manchester-united' }
    });
    
    console.log(`\n🔍 URL Verification:`);
    console.log(`   Expected: ${expectedUrl}`);
    console.log(`   Actual: ${analysis.seoUrl}`);
    console.log(`   Match: ${expectedUrl === analysis.seoUrl ? '✅ Yes' : '❌ No'}`);
    
    // 6. Verify entities were created
    console.log('\n📋 Created Entities:');
    
    if (analysis.sport) {
      console.log(`   Sport: ${analysis.sport.nameEn} (${analysis.sport.slug})`);
    }
    
    if (analysis.leagueRef) {
      console.log(`   League: ${analysis.leagueRef.nameEn} (${analysis.leagueRef.slug})`);
    }
    
    if (analysis.homeTeamRef) {
      console.log(`   Home Team: ${analysis.homeTeamRef.nameEn} (${analysis.homeTeamRef.slug})`);
    }
    
    if (analysis.awayTeamRef) {
      console.log(`   Away Team: ${analysis.awayTeamRef.nameEn} (${analysis.awayTeamRef.slug})`);
    }
    
    // 7. Test accessing the analysis via SEO URL
    console.log('\n🌐 Test URLs:');
    console.log(`   Frontend: http://localhost:3001${analysis.seoUrl}`);
    console.log(`   API: http://localhost:3001/api/analysis/seo/${analysis.seoSlug}`);
    
    console.log('\n✨ SEO URL generation test completed successfully!');
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error during SEO URL generation test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSeoUrlGeneration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});