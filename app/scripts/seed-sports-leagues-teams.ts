#!/usr/bin/env tsx
/**
 * Seed script for Sports, Leagues, and Teams
 * Creates the hierarchical structure for SEO-optimized URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sports data
const SPORTS = [
  {
    slug: 'soccer',
    nameEn: 'Soccer',
    nameKo: '축구',
    icon: '⚽',
    orderIndex: 1,
    description: 'The beautiful game - the world\'s most popular sport',
    keywords: ['soccer', 'football', '축구', 'premier league', 'champions league']
  },
  {
    slug: 'baseball',
    nameEn: 'Baseball',
    nameKo: '야구',
    icon: '⚾',
    orderIndex: 2,
    description: 'America\'s pastime and Korea\'s beloved sport',
    keywords: ['baseball', '야구', 'MLB', 'KBO', 'home run']
  },
  {
    slug: 'basketball',
    nameEn: 'Basketball',
    nameKo: '농구',
    icon: '🏀',
    orderIndex: 3,
    description: 'Fast-paced court action',
    keywords: ['basketball', '농구', 'NBA', 'KBL', 'slam dunk']
  },
  {
    slug: 'esports',
    nameEn: 'eSports',
    nameKo: 'e스포츠',
    icon: '🎮',
    orderIndex: 4,
    description: 'Competitive gaming at the highest level',
    keywords: ['esports', 'e스포츠', 'gaming', 'League of Legends', 'LCK']
  },
  {
    slug: 'volleyball',
    nameEn: 'Volleyball',
    nameKo: '배구',
    icon: '🏐',
    orderIndex: 5,
    description: 'High-flying volleyball action',
    keywords: ['volleyball', '배구', 'V-League', 'spike', 'serve']
  }
];

// Leagues data
const LEAGUES = [
  // Soccer leagues
  {
    sportSlug: 'soccer',
    slug: 'premier-league',
    nameEn: 'Premier League',
    nameKo: '프리미어리그',
    country: 'GB',
    tier: 1,
    currentSeason: '2025/26',
    description: 'The most-watched football league in the world',
    keywords: ['premier league', 'EPL', '프리미어리그', 'English football']
  },
  {
    sportSlug: 'soccer',
    slug: 'la-liga',
    nameEn: 'La Liga',
    nameKo: '라리가',
    country: 'ES',
    tier: 1,
    currentSeason: '2025/26',
    description: 'Spanish top-flight football',
    keywords: ['la liga', '라리가', 'Spanish football', 'Real Madrid', 'Barcelona']
  },
  {
    sportSlug: 'soccer',
    slug: 'k-league-1',
    nameEn: 'K League 1',
    nameKo: 'K리그1',
    country: 'KR',
    tier: 1,
    currentSeason: '2025',
    description: 'South Korea\'s premier football division',
    keywords: ['K League', 'K리그', 'Korean football', '한국축구']
  },
  {
    sportSlug: 'soccer',
    slug: 'champions-league',
    nameEn: 'UEFA Champions League',
    nameKo: 'UEFA 챔피언스리그',
    country: 'EU',
    tier: 1,
    currentSeason: '2025/26',
    description: 'Europe\'s premier club competition',
    keywords: ['Champions League', '챔피언스리그', 'UCL', 'European football']
  },
  
  // Baseball leagues
  {
    sportSlug: 'baseball',
    slug: 'mlb',
    nameEn: 'Major League Baseball',
    nameKo: '메이저리그',
    country: 'US',
    tier: 1,
    currentSeason: '2025',
    description: 'The pinnacle of professional baseball',
    keywords: ['MLB', '메이저리그', 'Major League Baseball', 'World Series']
  },
  {
    sportSlug: 'baseball',
    slug: 'kbo',
    nameEn: 'KBO League',
    nameKo: 'KBO 리그',
    country: 'KR',
    tier: 1,
    currentSeason: '2025',
    description: 'Korean professional baseball',
    keywords: ['KBO', 'KBO리그', 'Korean baseball', '한국야구']
  },
  
  // Basketball leagues
  {
    sportSlug: 'basketball',
    slug: 'nba',
    nameEn: 'National Basketball Association',
    nameKo: 'NBA',
    country: 'US',
    tier: 1,
    currentSeason: '2025/26',
    description: 'The world\'s premier basketball league',
    keywords: ['NBA', 'National Basketball Association', 'basketball']
  },
  {
    sportSlug: 'basketball',
    slug: 'kbl',
    nameEn: 'Korean Basketball League',
    nameKo: '한국프로농구',
    country: 'KR',
    tier: 1,
    currentSeason: '2025/26',
    description: 'Korean professional basketball',
    keywords: ['KBL', '한국프로농구', 'Korean basketball']
  },
  
  // eSports leagues
  {
    sportSlug: 'esports',
    slug: 'lck',
    nameEn: 'League of Legends Champions Korea',
    nameKo: 'LCK',
    country: 'KR',
    tier: 1,
    currentSeason: '2025',
    description: 'Premier League of Legends competition in Korea',
    keywords: ['LCK', 'League of Legends', '롤챔스', 'LoL']
  }
];

// Teams data (sample for each sport)
const TEAMS = [
  // Premier League teams
  {
    sportSlug: 'soccer',
    leagueSlug: 'premier-league',
    slug: 'liverpool',
    nameEn: 'Liverpool FC',
    nameKo: '리버풀 FC',
    shortName: 'Liverpool',
    abbreviation: 'LIV',
    country: 'GB',
    city: 'Liverpool',
    stadium: 'Anfield',
    capacity: 61276,
    founded: 1892,
    primaryColor: '#C8102E',
    secondaryColor: '#00B2A9'
  },
  {
    sportSlug: 'soccer',
    leagueSlug: 'premier-league',
    slug: 'manchester-united',
    nameEn: 'Manchester United',
    nameKo: '맨체스터 유나이티드',
    shortName: 'Man United',
    abbreviation: 'MUN',
    country: 'GB',
    city: 'Manchester',
    stadium: 'Old Trafford',
    capacity: 74310,
    founded: 1878,
    primaryColor: '#DA020E',
    secondaryColor: '#FFE500'
  },
  {
    sportSlug: 'soccer',
    leagueSlug: 'premier-league',
    slug: 'chelsea',
    nameEn: 'Chelsea FC',
    nameKo: '첼시 FC',
    shortName: 'Chelsea',
    abbreviation: 'CHE',
    country: 'GB',
    city: 'London',
    stadium: 'Stamford Bridge',
    capacity: 40341,
    founded: 1905,
    primaryColor: '#034694',
    secondaryColor: '#DBA111'
  },
  {
    sportSlug: 'soccer',
    leagueSlug: 'premier-league',
    slug: 'arsenal',
    nameEn: 'Arsenal FC',
    nameKo: '아스날 FC',
    shortName: 'Arsenal',
    abbreviation: 'ARS',
    country: 'GB',
    city: 'London',
    stadium: 'Emirates Stadium',
    capacity: 60704,
    founded: 1886,
    primaryColor: '#EF0107',
    secondaryColor: '#023474'
  },
  {
    sportSlug: 'soccer',
    leagueSlug: 'premier-league',
    slug: 'tottenham',
    nameEn: 'Tottenham Hotspur',
    nameKo: '토트넘 홋스퍼',
    shortName: 'Tottenham',
    abbreviation: 'TOT',
    country: 'GB',
    city: 'London',
    stadium: 'Tottenham Hotspur Stadium',
    capacity: 62850,
    founded: 1882,
    primaryColor: '#132257',
    secondaryColor: '#FFFFFF'
  },
  
  // K League teams
  {
    sportSlug: 'soccer',
    leagueSlug: 'k-league-1',
    slug: 'fc-seoul',
    nameEn: 'FC Seoul',
    nameKo: 'FC 서울',
    shortName: 'Seoul',
    abbreviation: 'SEO',
    country: 'KR',
    city: 'Seoul',
    stadium: 'Seoul World Cup Stadium',
    capacity: 66704,
    founded: 1983,
    primaryColor: '#E31937',
    secondaryColor: '#231F20'
  },
  {
    sportSlug: 'soccer',
    leagueSlug: 'k-league-1',
    slug: 'jeonbuk',
    nameEn: 'Jeonbuk Hyundai Motors',
    nameKo: '전북 현대 모터스',
    shortName: 'Jeonbuk',
    abbreviation: 'JEO',
    country: 'KR',
    city: 'Jeonju',
    stadium: 'Jeonju World Cup Stadium',
    capacity: 42477,
    founded: 1994,
    primaryColor: '#00A650',
    secondaryColor: '#E31937'
  },
  
  // MLB teams
  {
    sportSlug: 'baseball',
    leagueSlug: 'mlb',
    slug: 'la-dodgers',
    nameEn: 'Los Angeles Dodgers',
    nameKo: 'LA 다저스',
    shortName: 'Dodgers',
    abbreviation: 'LAD',
    country: 'US',
    city: 'Los Angeles',
    stadium: 'Dodger Stadium',
    capacity: 56000,
    founded: 1883,
    primaryColor: '#005A9C',
    secondaryColor: '#A5ACAF'
  },
  
  // KBO teams
  {
    sportSlug: 'baseball',
    leagueSlug: 'kbo',
    slug: 'lg-twins',
    nameEn: 'LG Twins',
    nameKo: 'LG 트윈스',
    shortName: 'LG',
    abbreviation: 'LG',
    country: 'KR',
    city: 'Seoul',
    stadium: 'Jamsil Baseball Stadium',
    capacity: 25000,
    founded: 1982,
    primaryColor: '#C30452',
    secondaryColor: '#231F20'
  },
  
  // NBA teams
  {
    sportSlug: 'basketball',
    leagueSlug: 'nba',
    slug: 'la-lakers',
    nameEn: 'Los Angeles Lakers',
    nameKo: 'LA 레이커스',
    shortName: 'Lakers',
    abbreviation: 'LAL',
    country: 'US',
    city: 'Los Angeles',
    stadium: 'Crypto.com Arena',
    capacity: 19079,
    founded: 1947,
    primaryColor: '#552583',
    secondaryColor: '#FDB927'
  }
];

async function seedSports() {
  console.log('🏆 Seeding sports...');
  
  for (const sport of SPORTS) {
    try {
      const created = await prisma.sport.upsert({
        where: { slug: sport.slug },
        update: {},
        create: sport
      });
      console.log(`✅ Created/Updated sport: ${created.nameEn}`);
    } catch (error) {
      console.error(`❌ Error creating sport ${sport.nameEn}:`, error);
    }
  }
}

async function seedLeagues() {
  console.log('🏅 Seeding leagues...');
  
  for (const league of LEAGUES) {
    try {
      // Get sport ID
      const sport = await prisma.sport.findUnique({
        where: { slug: league.sportSlug }
      });
      
      if (!sport) {
        console.error(`❌ Sport not found: ${league.sportSlug}`);
        continue;
      }
      
      const { sportSlug, ...leagueData } = league;
      
      const created = await prisma.league.upsert({
        where: { slug: league.slug },
        update: {},
        create: {
          ...leagueData,
          sportId: sport.id
        }
      });
      console.log(`✅ Created/Updated league: ${created.nameEn}`);
    } catch (error) {
      console.error(`❌ Error creating league ${league.nameEn}:`, error);
    }
  }
}

async function seedTeams() {
  console.log('🏃 Seeding teams...');
  
  for (const team of TEAMS) {
    try {
      // Get sport ID
      const sport = await prisma.sport.findUnique({
        where: { slug: team.sportSlug }
      });
      
      if (!sport) {
        console.error(`❌ Sport not found: ${team.sportSlug}`);
        continue;
      }
      
      // Get league ID
      const league = await prisma.league.findUnique({
        where: { slug: team.leagueSlug }
      });
      
      if (!league) {
        console.error(`❌ League not found: ${team.leagueSlug}`);
        continue;
      }
      
      const { sportSlug, leagueSlug, ...teamData } = team;
      
      // Create team
      const created = await prisma.team.upsert({
        where: { slug: team.slug },
        update: {},
        create: {
          ...teamData,
          sportId: sport.id,
          description: `${team.nameEn} - Professional ${sport.nameEn} team`,
          keywords: [team.nameEn, team.nameKo, team.shortName, sport.nameEn, league.nameEn]
        }
      });
      
      // Create team-league relationship
      await prisma.teamLeague.upsert({
        where: {
          teamId_leagueId_season: {
            teamId: created.id,
            leagueId: league.id,
            season: league.currentSeason || '2025'
          }
        },
        update: {},
        create: {
          teamId: created.id,
          leagueId: league.id,
          season: league.currentSeason || '2025'
        }
      });
      
      console.log(`✅ Created/Updated team: ${created.nameEn}`);
    } catch (error) {
      console.error(`❌ Error creating team ${team.nameEn}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting SEO database seeding...\n');
    
    await seedSports();
    console.log('');
    
    await seedLeagues();
    console.log('');
    
    await seedTeams();
    console.log('');
    
    // Display summary
    const sportCount = await prisma.sport.count();
    const leagueCount = await prisma.league.count();
    const teamCount = await prisma.team.count();
    
    console.log('📊 Seeding Summary:');
    console.log(`   Sports: ${sportCount}`);
    console.log(`   Leagues: ${leagueCount}`);
    console.log(`   Teams: ${teamCount}`);
    
    console.log('\n✨ SEO database seeding completed!');
    
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