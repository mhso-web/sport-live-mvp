import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMatchDates() {
  try {
    // Get today's date in KST
    const today = new Date();
    const kstToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    kstToday.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(kstToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('===== Match Date Analysis =====');
    console.log('Today (KST):', kstToday.toISOString());
    console.log('Tomorrow (KST):', tomorrow.toISOString());
    console.log();
    
    // Get all matches
    const allMatches = await prisma.match.findMany({
      orderBy: { scheduledTime: 'asc' },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        scheduledTime: true,
        status: true
      }
    });
    
    console.log(`Total matches in database: ${allMatches.length}`);
    console.log();
    
    // Group matches by date
    const matchesByDate = new Map<string, number>();
    allMatches.forEach(match => {
      const date = match.scheduledTime.toISOString().split('T')[0];
      matchesByDate.set(date, (matchesByDate.get(date) || 0) + 1);
    });
    
    console.log('Matches by date:');
    Array.from(matchesByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        console.log(`  ${date}: ${count} matches`);
      });
    
    // Check today's matches
    const todayMatches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: kstToday,
          lt: tomorrow
        }
      }
    });
    
    console.log();
    console.log(`Matches for today (${kstToday.toISOString().split('T')[0]}): ${todayMatches.length}`);
    
    if (todayMatches.length > 0) {
      console.log('Today\'s matches:');
      todayMatches.forEach(match => {
        console.log(`  - ${match.homeTeam} vs ${match.awayTeam} at ${match.scheduledTime.toLocaleTimeString('ko-KR')}`);
      });
    }
    
    // Get recent and upcoming matches
    const recentMatches = await prisma.match.findMany({
      take: 5,
      orderBy: { scheduledTime: 'desc' },
      where: {
        scheduledTime: {
          lt: kstToday
        }
      }
    });
    
    const upcomingMatches = await prisma.match.findMany({
      take: 5,
      orderBy: { scheduledTime: 'asc' },
      where: {
        scheduledTime: {
          gte: tomorrow
        }
      }
    });
    
    if (recentMatches.length > 0) {
      console.log('\nRecent past matches:');
      recentMatches.forEach(match => {
        console.log(`  - ${match.scheduledTime.toISOString().split('T')[0]}: ${match.homeTeam} vs ${match.awayTeam}`);
      });
    }
    
    if (upcomingMatches.length > 0) {
      console.log('\nUpcoming matches:');
      upcomingMatches.forEach(match => {
        console.log(`  - ${match.scheduledTime.toISOString().split('T')[0]}: ${match.homeTeam} vs ${match.awayTeam}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking match dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatchDates();