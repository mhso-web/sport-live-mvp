#!/usr/bin/env tsx
/**
 * Seed script for SportAnalysis with SEO-optimized content
 * Creates analyses visible on /analysis page
 */

import { PrismaClient, SportType, AnalysisStatus } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

// SEO-optimized analysis content for Premier League matches
const generateSportAnalysis = (match: any, authorId: number) => {
  const { homeTeam, awayTeam, venue, scheduledTime } = match;
  const matchDate = new Date(scheduledTime);
  const dateStr = matchDate.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Generate unique slug
  const baseSlug = slugify(
    `${matchDate.toISOString().split('T')[0]}-${homeTeam}-vs-${awayTeam}`,
    { lower: true, strict: true }
  );

  return {
    authorId,
    matchDate: scheduledTime,
    sportType: SportType.SOCCER,
    league: "Premier League",
    competition: "2025/26 Season",
    homeTeam,
    awayTeam,
    
    // SEO fields
    title: `${homeTeam} vs ${awayTeam} Preview & Betting Tips | Premier League ${dateStr}`,
    slug: baseSlug,
    metaDescription: `Expert analysis and predictions for ${homeTeam} vs ${awayTeam} Premier League match on ${dateStr}. Team news, tactical insights, and betting tips with 85% accuracy.`,
    metaKeywords: [
      'Premier League',
      homeTeam,
      awayTeam,
      'football predictions',
      'soccer betting tips',
      'match preview',
      dateStr,
      'Premier League 2025',
      'football analysis',
      'sports betting'
    ],
    
    // Team analysis
    homeFormation: "4-3-3",
    awayFormation: "4-4-2",
    
    homeAnalysis: `## ${homeTeam} Team Analysis

${homeTeam} enters this fixture with strong momentum from their pre-season preparations. The home advantage at ${venue} will be crucial, as they have maintained an impressive record at their fortress.

### Key Strengths:
- **Home Form**: Unbeaten in last 5 home matches across all competitions
- **Squad Depth**: Quality options in every position allowing tactical flexibility
- **Set Pieces**: Dangerous from corners and free-kicks with multiple aerial threats
- **Pressing Game**: High-intensity pressing to disrupt opposition build-up

### Recent Performance:
The team has shown excellent cohesion in pre-season, winning 3 of their 5 friendlies. New signings have integrated well, particularly in midfield where the team now has better balance and creativity.

### Tactical Approach:
Expected to dominate possession and territory, ${homeTeam} will look to establish control early. The wide players will be key in stretching the opposition defense, creating space for central runners.`,

    awayAnalysis: `## ${awayTeam} Team Analysis

${awayTeam} faces a challenging away fixture but comes prepared with a well-drilled defensive setup and dangerous counter-attacking options.

### Key Strengths:
- **Defensive Organization**: Compact shape difficult to break down
- **Counter-attacking**: Quick transitions with pacey forwards
- **Team Spirit**: Strong collective mentality and work ethic
- **Aerial Ability**: Threat from set pieces both defensively and offensively

### Recent Performance:
Mixed pre-season results but showed glimpses of quality, particularly in victories against strong opposition. The team has focused on defensive solidity while maintaining attacking threat.

### Tactical Approach:
Likely to adopt a pragmatic approach, sitting deeper and looking to exploit spaces on the counter. Wing-backs will be crucial in providing width while maintaining defensive stability.`,

    tacticalAnalysis: `## Tactical Analysis

### Formation Battle
${homeTeam}'s 4-3-3 vs ${awayTeam}'s 4-4-2 creates interesting tactical dynamics. The home side will have numerical superiority in midfield, but the visitors' compact shape could frustrate their build-up play.

### Key Battles
1. **Midfield Control**: ${homeTeam}'s extra midfielder should dominate possession
2. **Wide Areas**: Space for ${homeTeam}'s wingers vs ${awayTeam}'s narrow shape
3. **Defensive Line**: ${awayTeam} likely to defend deep, ${homeTeam} pushing high
4. **Set Pieces**: Both teams have aerial threats making dead balls crucial

### Expected Game Flow
${homeTeam} will likely dominate early possession, probing for openings. ${awayTeam} will be patient, looking to frustrate and hit on the break. The first goal will be crucial in determining the match's tactical evolution.`,

    keyPlayers: {
      [homeTeam]: [
        { name: "Star Striker", position: "Forward", importance: "Primary goal threat" },
        { name: "Creative Midfielder", position: "Midfield", importance: "Chance creator" },
        { name: "Defensive Leader", position: "Defense", importance: "Organizes backline" }
      ],
      [awayTeam]: [
        { name: "Target Man", position: "Forward", importance: "Hold-up play and aerial threat" },
        { name: "Box-to-box Mid", position: "Midfield", importance: "Energy and drive" },
        { name: "Experienced CB", position: "Defense", importance: "Defensive organization" }
      ]
    },

    injuryInfo: {
      [homeTeam]: ["Minor doubts over midfielder (75% chance to play)"],
      [awayTeam]: ["Full squad available"]
    },

    headToHead: {
      last5Meetings: [
        { date: "2024-12-15", result: `${homeTeam} 2-1 ${awayTeam}`, competition: "Premier League" },
        { date: "2024-08-20", result: `${awayTeam} 0-0 ${homeTeam}`, competition: "Premier League" },
        { date: "2024-03-10", result: `${homeTeam} 3-2 ${awayTeam}`, competition: "Premier League" },
        { date: "2023-11-25", result: `${awayTeam} 1-1 ${homeTeam}`, competition: "Premier League" },
        { date: "2023-04-15", result: `${homeTeam} 2-0 ${awayTeam}`, competition: "Premier League" }
      ],
      homeTeamWins: 3,
      draws: 2,
      awayTeamWins: 0
    },

    recentForm: {
      [homeTeam]: ["W", "W", "D", "W", "L"],
      [awayTeam]: ["D", "L", "W", "D", "W"]
    },

    predictionSummary: `Based on comprehensive analysis of form, head-to-head records, and tactical matchups, ${homeTeam} enters as favorites. Their home advantage and superior recent record against ${awayTeam} makes them likely winners.

However, ${awayTeam}'s defensive organization and counter-attacking threat means this won't be straightforward. The match will likely be decided by fine margins - a set piece, individual error, or moment of brilliance.

**Match Result Prediction**: ${homeTeam} Win (65% confidence)
**Score Prediction**: ${homeTeam} 2-1 ${awayTeam}
**Goals**: Over 2.5 goals likely (70% confidence)
**Both Teams to Score**: Yes (60% confidence)

The first goal will be crucial. If ${homeTeam} scores early, expect them to control the game. If ${awayTeam} keeps it tight past 30 minutes, they grow in confidence and the match becomes more open.`,

    confidenceLevel: 4, // Out of 5

    // Publishing status
    status: AnalysisStatus.PUBLISHED,
    isPublished: true,
    publishedAt: new Date(),
    isPinned: false,
    
    // Initial stats
    views: Math.floor(Math.random() * 500) + 100,
    likes: Math.floor(Math.random() * 50) + 10,
    commentsCount: Math.floor(Math.random() * 20) + 5
  };
};

async function createAnalystUser() {
  console.log('👤 Creating analyst user...');
  
  // Check if analyst exists
  let analyst = await prisma.user.findUnique({
    where: { email: 'analyst@sportslive.com' }
  });

  if (!analyst) {
    // Create analyst user
    analyst = await prisma.user.create({
      data: {
        email: 'analyst@sportslive.com',
        username: 'PremierExpert',
        passwordHash: '$2a$10$dummyhashedpassword', // Dummy hashed password
        role: 'ANALYST',
        level: 10,
        bio: 'Premier League Expert - Professional sports analyst with 10+ years of experience',
        analystProfile: {
          create: {
            displayName: 'Premier League Expert',
            description: 'Professional sports analyst specializing in Premier League football. 10+ years of experience in sports betting and tactical analysis.',
            specialties: ['Premier League', 'Football', 'Tactical Analysis', 'Betting Tips'],
            experience: '10+ years in sports analysis and betting',
            certification: 'Professional Sports Analyst Certification',
            totalPredictions: 245,
            correctPredictions: 168,
            averageAccuracy: 68.5,
            totalViews: 15230,
            totalLikes: 892,
            isVerified: true,
            verifiedAt: new Date('2024-01-01'),
            metadata: {
              socialLinks: {
                twitter: '@premierexpert',
                youtube: 'PremierLeagueAnalysis'
              },
              badges: ['verified', 'top_analyst', 'premier_league_expert']
            }
          }
        }
      }
    });
    console.log('✅ Created analyst user: PremierExpert');
  } else {
    console.log('✅ Analyst user already exists: PremierExpert');
  }

  return analyst.id;
}

async function seedSportAnalyses(authorId: number) {
  console.log('🔍 Fetching Premier League matches...');
  
  // Get matches from database
  const matches = await prisma.match.findMany({
    where: {
      league: "Premier League",
      season: "2025/26"
    },
    orderBy: {
      scheduledTime: 'asc'
    },
    take: 5 // Create analyses for first 5 matches
  });

  if (matches.length === 0) {
    console.log('❌ No Premier League matches found. Please run seed-premier-league-august-2025.ts first.');
    return;
  }

  console.log(`✅ Found ${matches.length} matches to analyze`);
  
  // Generate analyses
  for (const match of matches) {
    const analysisData = generateSportAnalysis(match, authorId);
    
    try {
      // Check if analysis already exists
      const existing = await prisma.sportAnalysis.findUnique({
        where: { slug: analysisData.slug }
      });

      if (existing) {
        console.log(`⚠️  Analysis already exists for ${match.homeTeam} vs ${match.awayTeam}`);
        continue;
      }

      // Create analysis with predictions
      const analysis = await prisma.sportAnalysis.create({
        data: {
          ...analysisData,
          predictions: {
            create: [
              {
                authorId,
                betType: 'MATCH_RESULT',
                prediction: `${match.homeTeam} Win`,
                odds: 1.85,
                stake: 3,
                reasoning: 'Home advantage and superior head-to-head record'
              },
              {
                authorId,
                betType: 'OVER_UNDER',
                prediction: 'Over 2.5 Goals',
                odds: 1.75,
                stake: 2,
                reasoning: 'Both teams have attacking quality and recent meetings have been high-scoring'
              },
              {
                authorId,
                betType: 'BOTH_SCORE',
                prediction: 'Yes',
                odds: 1.85,
                stake: 2,
                reasoning: 'Both teams have scored in 60% of recent meetings'
              }
            ]
          }
        }
      });

      console.log(`✅ Created analysis: ${analysis.title}`);
      console.log(`   URL: /analysis/${analysis.slug}`);
      console.log(`   SEO: ${analysisData.metaKeywords.length} keywords`);
      console.log(`   Views: ${analysis.views} | Likes: ${analysis.likes}`);
      
    } catch (error) {
      console.error(`❌ Error creating analysis for ${match.homeTeam} vs ${match.awayTeam}:`, error);
    }
  }
}

async function displayAnalyses() {
  console.log('\n📊 SportAnalysis Summary:');
  
  const analyses = await prisma.sportAnalysis.findMany({
    where: {
      status: AnalysisStatus.PUBLISHED
    },
    include: {
      author: true,
      predictions: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  console.log(`\n📈 Total published analyses: ${analyses.length}`);
  
  analyses.forEach((analysis, index) => {
    console.log(`\n${index + 1}. ${analysis.homeTeam} vs ${analysis.awayTeam}`);
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Author: ${analysis.author.username}`);
    console.log(`   URL: http://localhost:3001/analysis/${analysis.slug}`);
    console.log(`   Predictions: ${analysis.predictions.length}`);
    console.log(`   Confidence: ${analysis.confidenceLevel}/5`);
    console.log(`   Stats: ${analysis.views} views, ${analysis.likes} likes`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting SportAnalysis seeding for Premier League...\n');
    
    // Step 1: Create analyst user
    const authorId = await createAnalystUser();
    
    // Step 2: Seed analyses
    await seedSportAnalyses(authorId);
    
    // Step 3: Display summary
    await displayAnalyses();
    
    console.log('\n✨ SportAnalysis seeding completed!');
    console.log('📱 View analyses at: http://localhost:3001/analysis');
    console.log('🔍 Each analysis has SEO-optimized content and predictions');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});