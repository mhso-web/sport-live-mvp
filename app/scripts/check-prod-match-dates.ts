import { PrismaClient } from '@prisma/client';

// Production database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

async function checkProdMatchDates() {
  try {
    // Get today's date in KST
    const today = new Date();
    const kstToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    kstToday.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(kstToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('===== Production Match Date Analysis =====');
    console.log('Today (KST):', kstToday.toISOString());
    console.log('Tomorrow (KST):', tomorrow.toISOString());
    console.log('Current UTC:', new Date().toISOString());
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
    
    console.log(`Total matches in production database: ${allMatches.length}`);
    console.log();
    
    // Show first 10 matches with their times
    console.log('First 10 matches with UTC times:');
    allMatches.slice(0, 10).forEach(match => {
      console.log(`  ${match.scheduledTime.toISOString()} - ${match.homeTeam} vs ${match.awayTeam} (${match.status})`);
    });
    
    // Check today's matches using different timezone approaches
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayMatchesUTC = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    });
    
    console.log();
    console.log(`Matches for today UTC (${todayStart.toISOString()} to ${todayEnd.toISOString()}): ${todayMatchesUTC.length}`);
    
    // Check with KST offset (UTC+9)
    const kstOffset = new Date();
    kstOffset.setHours(kstOffset.getHours() - 9);
    kstOffset.setHours(0, 0, 0, 0);
    const kstOffsetEnd = new Date(kstOffset);
    kstOffsetEnd.setDate(kstOffsetEnd.getDate() + 1);
    
    const kstMatches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: kstOffset,
          lt: kstOffsetEnd
        }
      }
    });
    
    console.log(`Matches for today KST with offset (${kstOffset.toISOString()} to ${kstOffsetEnd.toISOString()}): ${kstMatches.length}`);
    
    if (kstMatches.length > 0) {
      console.log('\nToday\'s matches (KST):');
      kstMatches.forEach(match => {
        const kstTime = new Date(match.scheduledTime.getTime() + 9 * 60 * 60 * 1000);
        console.log(`  - ${match.homeTeam} vs ${match.awayTeam}`);
        console.log(`    UTC: ${match.scheduledTime.toISOString()}`);
        console.log(`    KST: ${kstTime.toISOString()}`);
        console.log(`    Status: ${match.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking production match dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProdMatchDates();