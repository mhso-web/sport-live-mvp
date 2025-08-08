import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMatchesAndAddAnalysis() {
  console.log('🔧 Fixing match dates and adding analysis data...\n');
  
  try {
    // 1. Reset all matches to their proper dates (original schedule)
    console.log('📅 Resetting match dates to original schedule...');
    
    // Get all matches ordered by ID
    const allMatches = await prisma.match.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Define proper schedule for August matches based on order
    const properSchedule = [
      { index: 0, date: new Date('2025-08-15T14:00:00Z') }, // Liverpool vs Bournemouth (15th)
      { index: 1, date: new Date('2025-08-16T14:00:00Z') }, // Aston Villa vs Newcastle
      { index: 2, date: new Date('2025-08-16T14:00:00Z') }, // Brighton vs Fulham
      { index: 3, date: new Date('2025-08-16T14:00:00Z') }, // Sunderland vs West Ham
      { index: 4, date: new Date('2025-08-16T16:30:00Z') }, // Tottenham vs Burnley
      { index: 5, date: new Date('2025-08-17T13:00:00Z') }, // Wolves vs Man City
      { index: 6, date: new Date('2025-08-17T15:30:00Z') }, // Chelsea vs Crystal Palace
      { index: 7, date: new Date('2025-08-17T15:30:00Z') }, // Nottingham vs Brentford
      { index: 8, date: new Date('2025-08-22T19:00:00Z') }, // West Ham vs Chelsea
      { index: 9, date: new Date('2025-08-23T11:30:00Z') }, // Man City vs Tottenham
      { index: 10, date: new Date('2025-08-23T14:00:00Z') }, // Everton vs Liverpool (Derby)
      { index: 11, date: new Date('2025-08-23T14:00:00Z') }, // Burnley vs Sunderland
      { index: 12, date: new Date('2025-08-23T14:00:00Z') }, // Bournemouth vs Wolves
      { index: 13, date: new Date('2025-08-23T14:00:00Z') }, // Brentford vs Aston Villa
      { index: 14, date: new Date('2025-08-23T14:00:00Z') }, // Arsenal vs Brighton
      { index: 15, date: new Date('2025-08-23T14:00:00Z') }, // Crystal Palace vs Nottingham
      { index: 16, date: new Date('2025-08-23T16:30:00Z') }, // Another match
      { index: 17, date: new Date('2025-08-24T13:00:00Z') }, // Fulham vs Man United
      { index: 18, date: new Date('2025-08-24T15:30:00Z') }, // Newcastle vs Leeds
      { index: 19, date: new Date('2025-08-29T19:00:00Z') }, // Aston Villa vs Crystal Palace
      { index: 20, date: new Date('2025-08-30T11:30:00Z') }, // Chelsea vs Fulham
      { index: 21, date: new Date('2025-08-30T14:00:00Z') }, // Leeds vs Newcastle
      { index: 22, date: new Date('2025-08-30T14:00:00Z') }, // Wolves vs Everton
      { index: 23, date: new Date('2025-08-30T14:00:00Z') }, // Tottenham vs Bournemouth
      { index: 24, date: new Date('2025-08-30T14:00:00Z') }, // Sunderland vs Brentford
      { index: 25, date: new Date('2025-08-30T14:00:00Z') }, // Man United vs Burnley
      { index: 26, date: new Date('2025-08-30T16:30:00Z') }, // Another match
      { index: 27, date: new Date('2025-08-31T13:00:00Z') }, // Brighton vs Man City
      { index: 28, date: new Date('2025-08-31T13:00:00Z') }, // Nottingham vs West Ham
      { index: 29, date: new Date('2025-08-31T15:30:00Z') }, // Liverpool vs Arsenal
    ];
    
    // Reset match dates to proper schedule
    for (const schedule of properSchedule) {
      if (schedule.index < allMatches.length) {
        const match = allMatches[schedule.index];
        await prisma.match.update({
          where: { id: match.id },
          data: { 
            scheduledTime: schedule.date,
            status: 'SCHEDULED' // Reset all to scheduled
          }
        });
        console.log(`  ✅ Reset match ${match.id}: ${match.homeTeam} vs ${match.awayTeam} to ${schedule.date.toISOString()}`);
      }
    }
    
    // 2. Set a few matches for today for demo purposes
    console.log('\n📌 Setting demo matches for today...');
    const today = new Date();
    const todayKST = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    
    // Set 3 matches for today at different times
    const demoTimes = [
      new Date(todayKST.setHours(19, 0, 0, 0)), // 7 PM KST
      new Date(todayKST.setHours(21, 0, 0, 0)), // 9 PM KST
      new Date(todayKST.setHours(23, 0, 0, 0)), // 11 PM KST
    ];
    
    // Use matches at index 5, 6, 7 as today's demo matches (Wolves, Chelsea, Nottingham)
    const demoIndices = [5, 6, 7];
    
    for (let i = 0; i < demoIndices.length && i < allMatches.length; i++) {
      const matchToUpdate = allMatches[demoIndices[i]];
      if (matchToUpdate) {
        const match = await prisma.match.update({
          where: { id: matchToUpdate.id },
          data: {
            scheduledTime: demoTimes[i],
            status: i === 0 ? 'LIVE' : 'SCHEDULED',
            homeScore: i === 0 ? 1 : 0,
            awayScore: i === 0 ? 0 : 0,
            currentMinute: i === 0 ? 35 : null
          }
        });
        console.log(`  ✅ Set demo match: ${match.homeTeam} vs ${match.awayTeam} at ${demoTimes[i].toLocaleString('ko-KR')}`);
      }
    }
    
    // 3. Create analysis data for some matches
    console.log('\n📊 Creating match analysis data...');
    
    // Get admin user for creator
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('  ❌ No admin user found, skipping analysis creation');
      return;
    }
    
    // Analysis templates with realistic data (using actual match IDs)
    const analysisTemplates = [
      {
        matchId: allMatches[0]?.id || 125, // Liverpool vs Bournemouth
        title: '리버풀 vs 본머스 - 프리미어리그 1라운드 분석',
        summary: '리버풀이 홈에서 본머스를 상대로 시즌 첫 승리를 노립니다.',
        content: `## 경기 개요
리버풀이 2025-26 시즌 프리미어리그 개막전에서 본머스를 홈으로 맞이합니다. 
지난 시즌 2위로 마감한 리버풀은 새 시즌 우승을 목표로 강력한 출발을 노리고 있습니다.

## 팀 분석

### 리버풀
- 최근 5경기: 3승 1무 1패
- 홈 성적: 지난 시즌 홈 19경기 15승 3무 1패
- 득점력: 경기당 평균 2.3골
- 주요 선수: 살라, 누네즈, 맥 알리스터

### 본머스
- 최근 5경기: 2승 2무 1패
- 원정 성적: 지난 시즌 원정 19경기 5승 4무 10패
- 득점력: 경기당 평균 1.1골
- 주요 선수: 솔랑케, 빌링, 쿡

## 예상 라인업
**리버풀 (4-3-3)**
알리송 - 알렉산더아놀드, 코나테, 반다이크, 로버트슨 - 엔도, 맥알리스터, 소보슬라이 - 살라, 누네즈, 디아스

**본머스 (4-4-2)**
네토 - 스미스, 메페함, 세네시, 켈리 - 타베르니에, 쿡, 빌링, 클루이베르트 - 솔랑케, 무어`,
        prediction: '리버풀 승리 예상 (70% 확률)',
        homeWinProb: 70,
        drawProb: 20,
        awayWinProb: 10,
        predictedScore: '2-0',
        keyFactors: ['홈 경기 이점', '전력 차이', '리버풀의 개막전 강세'],
        bettingTips: ['리버풀 승리', '2.5골 이상', '리버풀 클린시트'],
        headToHead: {
          matches: 10,
          homeWins: 7,
          draws: 2,
          awayWins: 1,
          lastMeeting: '2024-01-21: 리버풀 4-0 본머스'
        }
      },
      {
        matchId: allMatches[5]?.id || 130, // Wolves vs Man City (Today's match)
        title: '울버햄튼 vs 맨체스터 시티 - 빅매치 분석',
        summary: '프리미어리그 디펜딩 챔피언 맨시티가 울브스 원정에 나섭니다.',
        content: `## 경기 개요
맨체스터 시티가 울버햄튼 원더러스를 상대로 시즌 2라운드 경기를 펼칩니다.
지난 시즌 우승팀 맨시티는 개막전 승리 후 연승을 이어갈 것으로 예상됩니다.

## 팀 분석

### 울버햄튼
- 최근 5경기: 1승 2무 2패
- 홈 성적: 지난 시즌 홈 19경기 8승 5무 6패
- 득점력: 경기당 평균 1.2골
- 주요 선수: 쿠냐, 네토, 네베스

### 맨체스터 시티
- 최근 5경기: 4승 1무
- 원정 성적: 지난 시즌 원정 19경기 13승 4무 2패
- 득점력: 경기당 평균 2.8골
- 주요 선수: 홀란드, 데 브라위너, 베르나르두 실바

## AI 예측
맨시티의 압도적인 전력 우위로 원정 승리가 유력합니다.`,
        prediction: '맨체스터 시티 승리 예상 (75% 확률)',
        homeWinProb: 15,
        drawProb: 10,
        awayWinProb: 75,
        predictedScore: '1-3',
        keyFactors: ['맨시티 전력 우위', '홀란드 득점력', '울브스 수비 불안'],
        bettingTips: ['맨시티 승리', '3.5골 이상', '홀란드 득점'],
        headToHead: {
          matches: 10,
          homeWins: 1,
          draws: 2,
          awayWins: 7,
          lastMeeting: '2024-05-04: 울버햄튼 1-5 맨체스터 시티'
        }
      },
      {
        matchId: allMatches[6]?.id || 131, // Chelsea vs Crystal Palace (Today's match)
        title: '첼시 vs 크리스탈 팰리스 - 런던 더비',
        summary: '첼시가 크리스탈 팰리스를 상대로 홈 경기를 펼칩니다.',
        content: `## 경기 개요
런던 더비 매치! 첼시가 스탬포드 브릿지에서 크리스탈 팰리스를 맞이합니다.
새로운 감독 체제 하에 첼시는 안정적인 경기력을 보여주고 있습니다.

## 팀 분석

### 첼시
- 최근 5경기: 3승 1무 1패
- 홈 성적: 지난 시즌 홈 19경기 11승 4무 4패
- 득점력: 경기당 평균 1.9골
- 주요 선수: 엔쿤쿠, 파머, 엔조

### 크리스탈 팰리스
- 최근 5경기: 2승 1무 2패
- 원정 성적: 지난 시즌 원정 19경기 4승 5무 10패
- 득점력: 경기당 평균 1.0골
- 주요 선수: 에제, 올리세, 에두아르

## 전술 분석
첼시는 4-2-3-1 포메이션으로 측면 공격을 중심으로 경기를 풀어갈 것으로 예상됩니다.`,
        prediction: '첼시 승리 예상 (60% 확률)',
        homeWinProb: 60,
        drawProb: 25,
        awayWinProb: 15,
        predictedScore: '2-1',
        keyFactors: ['홈 이점', '첼시 공격진 상승세', '팰리스 원정 약세'],
        bettingTips: ['첼시 승리', '양팀 득점', '2.5골 이상'],
        headToHead: {
          matches: 10,
          homeWins: 6,
          draws: 2,
          awayWins: 2,
          lastMeeting: '2024-02-12: 첼시 3-1 크리스탈 팰리스'
        }
      }
    ];
    
    // Create analysis records
    for (const template of analysisTemplates) {
      const match = await prisma.match.findUnique({
        where: { id: template.matchId }
      });
      
      if (!match) continue;
      
      // Check if analysis already exists
      const existing = await prisma.sportAnalysis.findFirst({
        where: { matchId: template.matchId }
      });
      
      if (existing) {
        console.log(`  ⏭️  Analysis already exists for match ${template.matchId}`);
        continue;
      }
      
      const analysis = await prisma.sportAnalysis.create({
        data: {
          matchId: template.matchId,
          userId: adminUser.id,
          title: template.title,
          summary: template.summary,
          content: template.content,
          prediction: template.prediction,
          homeWinProb: template.homeWinProb,
          drawProb: template.drawProb,
          awayWinProb: template.awayWinProb,
          predictedScore: template.predictedScore,
          keyFactors: template.keyFactors,
          bettingTips: template.bettingTips,
          headToHead: template.headToHead,
          analysisType: 'MATCH_PREVIEW',
          confidence: 85,
          isPublished: true,
          publishedAt: new Date(),
          metadata: {
            model: 'AI-Sports-Analyzer-v2',
            version: '2.0.1',
            generatedAt: new Date().toISOString()
          }
        }
      });
      
      console.log(`  ✅ Created analysis for: ${match.homeTeam} vs ${match.awayTeam}`);
    }
    
    // Verify counts
    console.log('\n📊 Final data counts:');
    const matchCount = await prisma.match.count();
    const analysisCount = await prisma.sportAnalysis.count();
    const todayMatches = await prisma.match.count({
      where: {
        scheduledTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });
    
    console.log(`  Total matches: ${matchCount}`);
    console.log(`  Today's matches: ${todayMatches}`);
    console.log(`  Total analyses: ${analysisCount}`);
    
    console.log('\n✨ Match dates fixed and analysis data added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMatchesAndAddAnalysis();