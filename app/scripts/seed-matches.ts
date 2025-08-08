import { PrismaClient, SportType, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMatches() {
  console.log('🌱 Seeding matches...');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Sample teams for different sports
  const soccerTeams = [
    { home: 'FC 서울', away: '전북 현대', league: 'K리그1' },
    { home: '수원 삼성', away: '울산 현대', league: 'K리그1' },
    { home: '맨체스터 유나이티드', away: '리버풀', league: '프리미어리그' },
    { home: '레알 마드리드', away: '바르셀로나', league: '라리가' },
    { home: '바이에른 뮌헨', away: '도르트문트', league: '분데스리가' },
  ];

  const baseballTeams = [
    { home: 'LG 트윈스', away: '두산 베어스', league: 'KBO' },
    { home: 'SSG 랜더스', away: 'KT 위즈', league: 'KBO' },
    { home: '삼성 라이온즈', away: 'NC 다이노스', league: 'KBO' },
    { home: '요미우리 자이언츠', away: '한신 타이거스', league: 'NPB' },
  ];

  const basketballTeams = [
    { home: '서울 SK', away: '안양 KGC', league: 'KBL' },
    { home: '울산 현대모비스', away: '원주 DB', league: 'KBL' },
    { home: '레이커스', away: '워리어스', league: 'NBA' },
    { home: '셀틱스', away: '넷츠', league: 'NBA' },
  ];

  const esportsTeams = [
    { home: 'T1', away: 'Gen.G', league: 'LCK' },
    { home: 'DK', away: 'KT Rolster', league: 'LCK' },
    { home: 'Fnatic', away: 'G2 Esports', league: 'LEC' },
  ];

  const matches = [];
  
  // Generate matches for past 7 days and next 30 days
  for (let day = -7; day < 30; day++) {
    const matchDate = new Date(today);
    matchDate.setDate(matchDate.getDate() + day);
    
    // Soccer matches (2-3 per day)
    const soccerCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < soccerCount; i++) {
      const team = soccerTeams[Math.floor(Math.random() * soccerTeams.length)];
      const hour = Math.floor(Math.random() * 5) + 18; // 18:00 - 22:00
      const scheduledTime = new Date(matchDate);
      scheduledTime.setHours(hour, Math.random() > 0.5 ? 0 : 30, 0, 0);
      
      // Various match statuses based on date
      let status: MatchStatus = 'SCHEDULED';
      let homeScore = 0;
      let awayScore = 0;
      let currentMinute = null;
      
      if (day < 0) {
        // Past matches are finished
        status = 'FINISHED';
        homeScore = Math.floor(Math.random() * 4);
        awayScore = Math.floor(Math.random() * 4);
      } else if (day === 0) {
        // Today's matches: mix of live, scheduled, and finished
        const rand = Math.random();
        if (rand < 0.3) {
          status = 'LIVE';
          homeScore = Math.floor(Math.random() * 3);
          awayScore = Math.floor(Math.random() * 3);
          currentMinute = Math.floor(Math.random() * 90) + 1;
        } else if (rand < 0.5) {
          status = 'FINISHED';
          homeScore = Math.floor(Math.random() * 4);
          awayScore = Math.floor(Math.random() * 4);
        } else if (rand < 0.55) {
          status = 'CANCELLED';
        }
      } else if (day === 1 && Math.random() < 0.1) {
        // Tomorrow: small chance of postponed
        status = 'POSTPONED';
      } else if (day > 7 && Math.random() < 0.05) {
        // Future matches: rare cancellations
        status = 'CANCELLED';
      }
      
      matches.push({
        sportType: 'SOCCER' as SportType,
        league: team.league,
        season: '2024',
        country: team.league === 'K리그1' ? '대한민국' : undefined,
        homeTeam: team.home,
        awayTeam: team.away,
        scheduledTime,
        status,
        homeScore,
        awayScore,
        currentMinute,
        venue: `${team.home} 홈구장`,
        metadata: {
          broadcast: ['SPOTV', 'Coupang Play'][Math.floor(Math.random() * 2)],
        },
      });
    }
    
    // Baseball matches (1-2 per day, seasonal)
    if (day % 2 === 0) {
      const team = baseballTeams[Math.floor(Math.random() * baseballTeams.length)];
      const scheduledTime = new Date(matchDate);
      scheduledTime.setHours(18, 30, 0, 0);
      
      matches.push({
        sportType: 'BASEBALL' as SportType,
        league: team.league,
        season: '2024',
        country: team.league === 'KBO' ? '대한민국' : '일본',
        homeTeam: team.home,
        awayTeam: team.away,
        scheduledTime,
        status: 'SCHEDULED' as MatchStatus,
        homeScore: 0,
        awayScore: 0,
        currentMinute: null,
        venue: `${team.home} 홈구장`,
      });
    }
    
    // Basketball matches (1 per 3 days)
    if (day % 3 === 0) {
      const team = basketballTeams[Math.floor(Math.random() * basketballTeams.length)];
      const scheduledTime = new Date(matchDate);
      scheduledTime.setHours(19, 0, 0, 0);
      
      matches.push({
        sportType: 'BASKETBALL' as SportType,
        league: team.league,
        season: '2024',
        country: team.league === 'KBL' ? '대한민국' : '미국',
        homeTeam: team.home,
        awayTeam: team.away,
        scheduledTime,
        status: 'SCHEDULED' as MatchStatus,
        homeScore: 0,
        awayScore: 0,
        currentMinute: null,
        venue: `${team.home} 홈구장`,
      });
    }
    
    // E-sports matches (1 per 4 days)
    if (day % 4 === 0) {
      const team = esportsTeams[Math.floor(Math.random() * esportsTeams.length)];
      const scheduledTime = new Date(matchDate);
      scheduledTime.setHours(17, 0, 0, 0);
      
      matches.push({
        sportType: 'ESPORTS' as SportType,
        league: team.league,
        season: 'Spring 2024',
        country: team.league === 'LCK' ? '대한민국' : '유럽',
        homeTeam: team.home,
        awayTeam: team.away,
        scheduledTime,
        status: 'SCHEDULED' as MatchStatus,
        homeScore: 0,
        awayScore: 0,
        currentMinute: null,
        venue: 'LoL Park',
        metadata: {
          game: 'League of Legends',
          bestOf: 3,
        },
      });
    }
  }

  // Clear existing matches
  await prisma.match.deleteMany({});
  console.log('🗑️  Cleared existing matches');

  // Insert new matches
  const created = await prisma.match.createMany({
    data: matches,
  });

  console.log(`✅ Created ${created.count} matches`);
  
  // Add match events for live and finished matches
  const matchesWithEvents = await prisma.match.findMany({
    where: { 
      OR: [
        { status: 'LIVE' },
        { status: 'FINISHED' }
      ]
    },
  });

  console.log(`📊 Adding events for ${matchesWithEvents.length} matches...`);

  for (const match of matchesWithEvents) {
    const events = [];
    
    // Add goal events based on scores
    for (let i = 0; i < match.homeScore; i++) {
      events.push({
        matchId: match.id,
        eventType: 'GOAL',
        eventMinute: Math.floor(Math.random() * 90) + 1,
        team: 'HOME' as const,
        playerName: `홈팀 선수 ${i + 1}`,
        description: '골 득점',
      });
    }
    
    for (let i = 0; i < match.awayScore; i++) {
      events.push({
        matchId: match.id,
        eventType: 'GOAL',
        eventMinute: Math.floor(Math.random() * 90) + 1,
        team: 'AWAY' as const,
        playerName: `원정팀 선수 ${i + 1}`,
        description: '골 득점',
      });
    }
    
    // Add yellow cards randomly
    if (Math.random() < 0.5) {
      events.push({
        matchId: match.id,
        eventType: 'YELLOW_CARD',
        eventMinute: Math.floor(Math.random() * 90) + 1,
        team: Math.random() > 0.5 ? 'HOME' : 'AWAY' as const,
        playerName: '선수',
        description: '경고',
      });
    }
    
    // Add red cards rarely
    if (Math.random() < 0.1) {
      events.push({
        matchId: match.id,
        eventType: 'RED_CARD',
        eventMinute: Math.floor(Math.random() * 90) + 1,
        team: Math.random() > 0.5 ? 'HOME' : 'AWAY' as const,
        playerName: '선수',
        description: '퇴장',
      });
    }
    
    if (events.length > 0) {
      // Sort events by minute
      events.sort((a, b) => a.eventMinute - b.eventMinute);
      await prisma.matchEvent.createMany({ data: events });
    }
  }

  console.log('✅ Added events for live and finished matches');
}

seedMatches()
  .then(async () => {
    // Print summary statistics
    const stats = await prisma.match.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('\n📈 Match Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count} matches`);
    });
    
    const totalMatches = await prisma.match.count();
    const totalEvents = await prisma.matchEvent.count();
    console.log(`\n   Total: ${totalMatches} matches, ${totalEvents} events`);
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Seeding completed!');
  });