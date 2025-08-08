#!/usr/bin/env tsx
/**
 * Test script to debug analysis creation
 */

import { AnalysisServiceSEO } from '../lib/services/analysisService.seo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalysisCreation() {
  try {
    console.log('🧪 Testing analysis creation directly...\n');
    
    // Find admin user
    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { analystProfile: true }
    });
    
    if (!user) {
      throw new Error('Admin user not found');
    }
    
    // Ensure analyst profile exists
    if (!user.analystProfile) {
      await prisma.analystProfile.create({
        data: {
          userId: user.id,
          displayName: 'Admin Analyst',
          specialties: ['Soccer', 'Analysis'],
          description: 'Admin analyst profile',
          isVerified: true,
          averageAccuracy: 80.0,
        }
      });
      console.log('Created analyst profile for admin user');
    }
    
    const testData = {
      matchDate: '2025-08-16T11:30:00Z',
      sportType: 'SOCCER' as const,
      league: 'Premier League',
      competition: '2025/26',
      homeTeam: 'Aston Villa',
      awayTeam: 'Newcastle United',
      title: 'Premier League Aston Villa vs Newcastle United 경기 분석',
      metaDescription: 'Test analysis',
      metaKeywords: ['test', 'analysis'],
      homeFormation: '4-4-2',
      awayFormation: '4-3-3',
      homeAnalysis: 'Aston Villa has been in excellent form',
      awayAnalysis: 'Newcastle United has shown inconsistent form',
      tacticalAnalysis: 'Tactical battle expected',
      keyPlayers: { home: ['Player1'], away: ['Player2'] },
      injuryInfo: { home: [], away: [] },
      headToHead: { lastMeetings: [] },
      recentForm: { home: ['W', 'W', 'W'], away: ['W', 'D', 'L'] },
      predictionSummary: 'Villa likely to win',
      confidenceLevel: 3,
      predictions: [
        {
          betType: 'MATCH_RESULT' as const,
          prediction: 'Home Win',
          odds: 2.1,
          stake: 3,
          reasoning: 'Home form favors Villa',
        }
      ],
    };
    
    console.log('📝 Creating analysis with data:', JSON.stringify(testData, null, 2));
    
    const result = await AnalysisServiceSEO.createWithSeoUrl(testData as any, user.id);
    
    console.log('\n✅ Success! Analysis created:');
    console.log('   ID:', result.id);
    console.log('   Title:', result.title);
    console.log('   SEO URL:', result.seoUrl);
    
  } catch (error) {
    console.error('\n❌ Error creating analysis:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAnalysisCreation();