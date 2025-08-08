import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMatchDates() {
  try {
    console.log('🚀 Updating match dates for testing...\n');
    
    // Get today's date in KST
    const today = new Date();
    const kstToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    
    // Set different times for today's matches
    const times = [
      new Date(kstToday.setHours(15, 0, 0, 0)), // 3:00 PM KST
      new Date(kstToday.setHours(18, 0, 0, 0)), // 6:00 PM KST
      new Date(kstToday.setHours(20, 0, 0, 0)), // 8:00 PM KST
      new Date(kstToday.setHours(22, 0, 0, 0)), // 10:00 PM KST
      new Date(kstToday.setHours(23, 30, 0, 0)), // 11:30 PM KST
    ];
    
    // Get 5 matches to update
    const matchesToUpdate = await prisma.match.findMany({
      take: 5,
      orderBy: { scheduledTime: 'asc' }
    });
    
    console.log(`Found ${matchesToUpdate.length} matches to update`);
    
    // Update matches with today's date
    for (let i = 0; i < matchesToUpdate.length && i < times.length; i++) {
      const match = matchesToUpdate[i];
      const newTime = times[i];
      
      await prisma.match.update({
        where: { id: match.id },
        data: { 
          scheduledTime: newTime,
          status: i < 2 ? 'FINISHED' : i === 2 ? 'LIVE' : 'SCHEDULED'
        }
      });
      
      console.log(`✅ Updated match: ${match.homeTeam} vs ${match.awayTeam}`);
      console.log(`   New time: ${newTime.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`);
      console.log(`   Status: ${i < 2 ? 'FINISHED' : i === 2 ? 'LIVE' : 'SCHEDULED'}`);
    }
    
    // Also update some matches for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKst = new Date(tomorrow.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    
    const tomorrowTimes = [
      new Date(tomorrowKst.setHours(16, 0, 0, 0)),
      new Date(tomorrowKst.setHours(19, 0, 0, 0)),
      new Date(tomorrowKst.setHours(21, 0, 0, 0)),
    ];
    
    const tomorrowMatches = await prisma.match.findMany({
      skip: 5,
      take: 3,
      orderBy: { scheduledTime: 'asc' }
    });
    
    console.log(`\nUpdating ${tomorrowMatches.length} matches for tomorrow`);
    
    for (let i = 0; i < tomorrowMatches.length && i < tomorrowTimes.length; i++) {
      const match = tomorrowMatches[i];
      const newTime = tomorrowTimes[i];
      
      await prisma.match.update({
        where: { id: match.id },
        data: { 
          scheduledTime: newTime,
          status: 'SCHEDULED'
        }
      });
      
      console.log(`✅ Updated match: ${match.homeTeam} vs ${match.awayTeam}`);
      console.log(`   New time: ${newTime.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`);
    }
    
    // Verify the updates
    console.log('\n📊 Verification:');
    const todayStart = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayMatchesCount = await prisma.match.count({
      where: {
        scheduledTime: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    });
    
    const tomorrowStart = new Date(todayEnd);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    
    const tomorrowMatchesCount = await prisma.match.count({
      where: {
        scheduledTime: {
          gte: tomorrowStart,
          lt: tomorrowEnd
        }
      }
    });
    
    console.log(`Today's matches: ${todayMatchesCount}`);
    console.log(`Tomorrow's matches: ${tomorrowMatchesCount}`);
    
    console.log('\n✨ Match dates updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating match dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMatchDates();