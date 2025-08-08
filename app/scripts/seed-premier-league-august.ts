#!/usr/bin/env tsx
/**
 * Seed script for Premier League August 2024 fixtures
 * This script clears existing match data and populates with real fixtures
 */

import { PrismaClient, SportType, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Real Premier League fixtures for August 2025 (2025/26 Season)
const PREMIER_LEAGUE_AUGUST_2025 = [
  // Gameweek 1 - August 15-18, 2025
  {
    homeTeam: "Liverpool",
    awayTeam: "AFC Bournemouth",
    scheduledTime: new Date("2025-08-15T19:00:00Z"), // 20:00 UK time
    venue: "Anfield"
  },
  {
    homeTeam: "Aston Villa",
    awayTeam: "Newcastle United",
    scheduledTime: new Date("2025-08-16T11:30:00Z"), // 12:30 UK time
    venue: "Villa Park"
  },
  {
    homeTeam: "Brighton & Hove Albion",
    awayTeam: "Fulham",
    scheduledTime: new Date("2025-08-16T14:00:00Z"), // 15:00 UK time
    venue: "American Express Stadium"
  },
  {
    homeTeam: "Sunderland",
    awayTeam: "West Ham United",
    scheduledTime: new Date("2025-08-16T14:00:00Z"),
    venue: "Stadium of Light"
  },
  {
    homeTeam: "Tottenham Hotspur",
    awayTeam: "Burnley",
    scheduledTime: new Date("2025-08-16T14:00:00Z"),
    venue: "Tottenham Hotspur Stadium"
  },
  {
    homeTeam: "Wolverhampton Wanderers",
    awayTeam: "Manchester City",
    scheduledTime: new Date("2025-08-16T16:30:00Z"), // 17:30 UK time
    venue: "Molineux Stadium"
  },
  {
    homeTeam: "Chelsea",
    awayTeam: "Crystal Palace",
    scheduledTime: new Date("2025-08-17T13:00:00Z"), // 14:00 UK time
    venue: "Stamford Bridge"
  },
  {
    homeTeam: "Nottingham Forest",
    awayTeam: "Brentford",
    scheduledTime: new Date("2025-08-17T13:00:00Z"),
    venue: "The City Ground"
  },
  {
    homeTeam: "Manchester United",
    awayTeam: "Arsenal",
    scheduledTime: new Date("2025-08-17T15:30:00Z"), // 16:30 UK time
    venue: "Old Trafford"
  },
  {
    homeTeam: "Ipswich Town",
    awayTeam: "Liverpool",
    scheduledTime: new Date("2024-08-17T12:30:00Z"),
    venue: "Portman Road"
  },
  {
    homeTeam: "Arsenal",
    awayTeam: "Wolverhampton Wanderers",
    scheduledTime: new Date("2024-08-17T15:00:00Z"),
    venue: "Emirates Stadium"
  },
  {
    homeTeam: "Everton",
    awayTeam: "Brighton & Hove Albion",
    scheduledTime: new Date("2024-08-17T15:00:00Z"),
    venue: "Goodison Park"
  },
  {
    homeTeam: "Newcastle United",
    awayTeam: "Southampton",
    scheduledTime: new Date("2024-08-17T15:00:00Z"),
    venue: "St James' Park"
  },
  {
    homeTeam: "Nottingham Forest",
    awayTeam: "AFC Bournemouth",
    scheduledTime: new Date("2024-08-17T15:00:00Z"),
    venue: "The City Ground"
  },
  {
    homeTeam: "West Ham United",
    awayTeam: "Aston Villa",
    scheduledTime: new Date("2024-08-17T17:30:00Z"),
    venue: "London Stadium"
  },
  {
    homeTeam: "Brentford",
    awayTeam: "Crystal Palace",
    scheduledTime: new Date("2024-08-18T14:00:00Z"),
    venue: "Brentford Community Stadium"
  },
  {
    homeTeam: "Chelsea",
    awayTeam: "Manchester City",
    scheduledTime: new Date("2024-08-18T16:30:00Z"),
    venue: "Stamford Bridge"
  },
  {
    homeTeam: "Leicester City",
    awayTeam: "Tottenham Hotspur",
    scheduledTime: new Date("2024-08-19T20:00:00Z"),
    venue: "King Power Stadium"
  },

  // Gameweek 2 - August 24-25, 2024
  {
    homeTeam: "Brighton & Hove Albion",
    awayTeam: "Manchester United",
    scheduledTime: new Date("2024-08-24T12:30:00Z"),
    venue: "American Express Stadium"
  },
  {
    homeTeam: "Crystal Palace",
    awayTeam: "West Ham United",
    scheduledTime: new Date("2024-08-24T15:00:00Z"),
    venue: "Selhurst Park"
  },
  {
    homeTeam: "Fulham",
    awayTeam: "Leicester City",
    scheduledTime: new Date("2024-08-24T15:00:00Z"),
    venue: "Craven Cottage"
  },
  {
    homeTeam: "Manchester City",
    awayTeam: "Ipswich Town",
    scheduledTime: new Date("2024-08-24T15:00:00Z"),
    venue: "Etihad Stadium"
  },
  {
    homeTeam: "Southampton",
    awayTeam: "Nottingham Forest",
    scheduledTime: new Date("2024-08-24T15:00:00Z"),
    venue: "St Mary's Stadium"
  },
  {
    homeTeam: "Tottenham Hotspur",
    awayTeam: "Everton",
    scheduledTime: new Date("2024-08-24T15:00:00Z"),
    venue: "Tottenham Hotspur Stadium"
  },
  {
    homeTeam: "Aston Villa",
    awayTeam: "Arsenal",
    scheduledTime: new Date("2024-08-24T17:30:00Z"),
    venue: "Villa Park"
  },
  {
    homeTeam: "AFC Bournemouth",
    awayTeam: "Newcastle United",
    scheduledTime: new Date("2024-08-25T14:00:00Z"),
    venue: "Vitality Stadium"
  },
  {
    homeTeam: "Wolverhampton Wanderers",
    awayTeam: "Chelsea",
    scheduledTime: new Date("2024-08-25T14:00:00Z"),
    venue: "Molineux Stadium"
  },
  {
    homeTeam: "Liverpool",
    awayTeam: "Brentford",
    scheduledTime: new Date("2024-08-25T16:30:00Z"),
    venue: "Anfield"
  },

  // Gameweek 3 - August 31 - September 1, 2024
  {
    homeTeam: "Arsenal",
    awayTeam: "Brighton & Hove Albion",
    scheduledTime: new Date("2024-08-31T12:30:00Z"),
    venue: "Emirates Stadium"
  },
  {
    homeTeam: "Brentford",
    awayTeam: "Southampton",
    scheduledTime: new Date("2024-08-31T15:00:00Z"),
    venue: "Brentford Community Stadium"
  },
  {
    homeTeam: "Everton",
    awayTeam: "AFC Bournemouth",
    scheduledTime: new Date("2024-08-31T15:00:00Z"),
    venue: "Goodison Park"
  },
  {
    homeTeam: "Ipswich Town",
    awayTeam: "Fulham",
    scheduledTime: new Date("2024-08-31T15:00:00Z"),
    venue: "Portman Road"
  },
  {
    homeTeam: "Leicester City",
    awayTeam: "Aston Villa",
    scheduledTime: new Date("2024-08-31T15:00:00Z"),
    venue: "King Power Stadium"
  },
  {
    homeTeam: "Nottingham Forest",
    awayTeam: "Wolverhampton Wanderers",
    scheduledTime: new Date("2024-08-31T15:00:00Z"),
    venue: "The City Ground"
  },
  {
    homeTeam: "West Ham United",
    awayTeam: "Manchester City",
    scheduledTime: new Date("2024-08-31T17:30:00Z"),
    venue: "London Stadium"
  }
];

async function clearExistingMatches() {
  console.log('🗑️  Clearing existing match data...');
  const deleted = await prisma.match.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} existing matches`);
}

async function seedPremierLeagueMatches() {
  console.log('🌱 Seeding Premier League August 2024 fixtures...');
  
  const matches = PREMIER_LEAGUE_AUGUST_2024.map((match, index) => ({
    externalId: `PL2024_AUG_${index + 1}`,
    sportType: SportType.SOCCER,
    league: "Premier League",
    season: "2024/25",
    country: "England",
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    scheduledTime: match.scheduledTime,
    status: MatchStatus.SCHEDULED,
    venue: match.venue,
    homeScore: 0,
    awayScore: 0,
    metadata: {
      competition: "Premier League",
      round: Math.ceil((index + 1) / 10), // Gameweek number
      broadcaster: ["Sky Sports", "BT Sport", "Amazon Prime"],
      referees: null
    }
  }));

  const created = await prisma.match.createMany({
    data: matches,
    skipDuplicates: true
  });

  console.log(`✅ Created ${created.count} Premier League matches`);
  return created.count;
}

async function displaySeededMatches() {
  console.log('\n📊 Seeded Matches Summary:');
  
  const matches = await prisma.match.findMany({
    where: {
      league: "Premier League",
      season: "2024/25"
    },
    orderBy: {
      scheduledTime: 'asc'
    },
    take: 5
  });

  console.log('\nFirst 5 matches:');
  matches.forEach(match => {
    const date = match.scheduledTime.toLocaleDateString('en-GB');
    const time = match.scheduledTime.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    console.log(`  ${date} ${time} - ${match.homeTeam} vs ${match.awayTeam} at ${match.venue}`);
  });

  const totalCount = await prisma.match.count({
    where: {
      league: "Premier League",
      season: "2024/25"
    }
  });

  console.log(`\n📈 Total Premier League matches in database: ${totalCount}`);
}

async function main() {
  try {
    console.log('🚀 Starting Premier League August 2024 seeding process...\n');
    
    // Step 1: Clear existing matches
    await clearExistingMatches();
    
    // Step 2: Seed Premier League matches
    const count = await seedPremierLeagueMatches();
    
    // Step 3: Display summary
    await displaySeededMatches();
    
    console.log('\n✨ Seeding completed successfully!');
    console.log('You can now test the LangGraph workflow with real Premier League data.');
    
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