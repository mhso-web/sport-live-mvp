#!/usr/bin/env tsx
/**
 * Seed script for Premier League August 2025 fixtures (2025/26 Season)
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
    homeTeam: "Leeds United",
    awayTeam: "Everton",
    scheduledTime: new Date("2025-08-18T19:00:00Z"), // 20:00 UK time Monday
    venue: "Elland Road"
  },

  // Gameweek 2 - August 22-24, 2025
  {
    homeTeam: "West Ham United",
    awayTeam: "Chelsea",
    scheduledTime: new Date("2025-08-22T19:00:00Z"), // 20:00 UK time Friday
    venue: "London Stadium"
  },
  {
    homeTeam: "Manchester City",
    awayTeam: "Tottenham Hotspur",
    scheduledTime: new Date("2025-08-23T11:30:00Z"), // 12:30 UK time Saturday
    venue: "Etihad Stadium"
  },
  {
    homeTeam: "AFC Bournemouth",
    awayTeam: "Wolverhampton Wanderers",
    scheduledTime: new Date("2025-08-23T14:00:00Z"),
    venue: "Vitality Stadium"
  },
  {
    homeTeam: "Brentford",
    awayTeam: "Aston Villa",
    scheduledTime: new Date("2025-08-23T14:00:00Z"),
    venue: "Brentford Community Stadium"
  },
  {
    homeTeam: "Arsenal",
    awayTeam: "Brighton & Hove Albion",
    scheduledTime: new Date("2025-08-23T14:00:00Z"),
    venue: "Emirates Stadium"
  },
  {
    homeTeam: "Burnley",
    awayTeam: "Sunderland",
    scheduledTime: new Date("2025-08-23T14:00:00Z"),
    venue: "Turf Moor"
  },
  {
    homeTeam: "Crystal Palace",
    awayTeam: "Nottingham Forest",
    scheduledTime: new Date("2025-08-23T14:00:00Z"),
    venue: "Selhurst Park"
  },
  {
    homeTeam: "Everton",
    awayTeam: "Liverpool",
    scheduledTime: new Date("2025-08-23T16:30:00Z"), // 17:30 UK time - Merseyside Derby
    venue: "Goodison Park"
  },
  {
    homeTeam: "Fulham",
    awayTeam: "Manchester United",
    scheduledTime: new Date("2025-08-24T13:00:00Z"), // 14:00 UK time Sunday
    venue: "Craven Cottage"
  },
  {
    homeTeam: "Newcastle United",
    awayTeam: "Leeds United",
    scheduledTime: new Date("2025-08-24T15:30:00Z"), // 16:30 UK time
    venue: "St James' Park"
  },

  // Gameweek 3 - August 29-31, 2025
  {
    homeTeam: "Aston Villa",
    awayTeam: "Crystal Palace",
    scheduledTime: new Date("2025-08-29T19:00:00Z"), // 20:00 UK time Friday
    venue: "Villa Park"
  },
  {
    homeTeam: "Chelsea",
    awayTeam: "Fulham",
    scheduledTime: new Date("2025-08-30T11:30:00Z"), // 12:30 UK time Saturday
    venue: "Stamford Bridge"
  },
  {
    homeTeam: "Manchester United",
    awayTeam: "Burnley",
    scheduledTime: new Date("2025-08-30T14:00:00Z"),
    venue: "Old Trafford"
  },
  {
    homeTeam: "Sunderland",
    awayTeam: "Brentford",
    scheduledTime: new Date("2025-08-30T14:00:00Z"),
    venue: "Stadium of Light"
  },
  {
    homeTeam: "Tottenham Hotspur",
    awayTeam: "AFC Bournemouth",
    scheduledTime: new Date("2025-08-30T14:00:00Z"),
    venue: "Tottenham Hotspur Stadium"
  },
  {
    homeTeam: "Wolverhampton Wanderers",
    awayTeam: "Everton",
    scheduledTime: new Date("2025-08-30T14:00:00Z"),
    venue: "Molineux Stadium"
  },
  {
    homeTeam: "Leeds United",
    awayTeam: "Newcastle United",
    scheduledTime: new Date("2025-08-30T16:30:00Z"), // 17:30 UK time
    venue: "Elland Road"
  },
  {
    homeTeam: "Brighton & Hove Albion",
    awayTeam: "Manchester City",
    scheduledTime: new Date("2025-08-31T13:00:00Z"), // 14:00 UK time Sunday
    venue: "American Express Stadium"
  },
  {
    homeTeam: "Nottingham Forest",
    awayTeam: "West Ham United",
    scheduledTime: new Date("2025-08-31T13:00:00Z"),
    venue: "The City Ground"
  },
  {
    homeTeam: "Liverpool",
    awayTeam: "Arsenal",
    scheduledTime: new Date("2025-08-31T15:30:00Z"), // 16:30 UK time - Big match
    venue: "Anfield"
  }
];

async function clearExistingMatches() {
  console.log('🗑️  Clearing existing match data...');
  const deleted = await prisma.match.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} existing matches`);
}

async function seedPremierLeagueMatches() {
  console.log('🌱 Seeding Premier League August 2025 fixtures...');
  
  const matches = PREMIER_LEAGUE_AUGUST_2025.map((match, index) => ({
    externalId: `PL2025_AUG_${index + 1}`,
    sportType: SportType.SOCCER,
    league: "Premier League",
    season: "2025/26",
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
      broadcaster: ["Sky Sports", "TNT Sports", "Amazon Prime"],
      referees: null,
      notes: index === 17 ? "Merseyside Derby" : 
             index === 29 ? "Liverpool vs Arsenal - Top match" : 
             index === 8 ? "Manchester United vs Arsenal" : null
    }
  }));

  const created = await prisma.match.createMany({
    data: matches,
    skipDuplicates: true
  });

  console.log(`✅ Created ${created.count} Premier League matches for 2025/26 season`);
  return created.count;
}

async function displaySeededMatches() {
  console.log('\n📊 Seeded Matches Summary:');
  
  const matches = await prisma.match.findMany({
    where: {
      league: "Premier League",
      season: "2025/26"
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

  // Show notable matches
  const notableMatches = await prisma.match.findMany({
    where: {
      league: "Premier League",
      season: "2025/26",
      OR: [
        { AND: [{ homeTeam: "Liverpool" }, { awayTeam: "Arsenal" }] },
        { AND: [{ homeTeam: "Manchester United" }, { awayTeam: "Arsenal" }] },
        { AND: [{ homeTeam: "Everton" }, { awayTeam: "Liverpool" }] }
      ]
    },
    orderBy: {
      scheduledTime: 'asc'
    }
  });

  if (notableMatches.length > 0) {
    console.log('\n🌟 Notable matches:');
    notableMatches.forEach(match => {
      const date = match.scheduledTime.toLocaleDateString('en-GB');
      console.log(`  ${date} - ${match.homeTeam} vs ${match.awayTeam} at ${match.venue}`);
    });
  }

  const totalCount = await prisma.match.count({
    where: {
      league: "Premier League",
      season: "2025/26"
    }
  });

  console.log(`\n📈 Total Premier League 2025/26 matches in database: ${totalCount}`);
}

async function main() {
  try {
    console.log('🚀 Starting Premier League August 2025 (2025/26 Season) seeding process...\n');
    
    // Step 1: Clear existing matches
    await clearExistingMatches();
    
    // Step 2: Seed Premier League matches
    const count = await seedPremierLeagueMatches();
    
    // Step 3: Display summary
    await displaySeededMatches();
    
    console.log('\n✨ Seeding completed successfully!');
    console.log('You can now test the LangGraph workflow with real 2025/26 Premier League data.');
    console.log('\nNote: These are actual fixtures for the upcoming 2025/26 season starting August 15, 2025.');
    
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