import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAnalysisData() {
  console.log('📊 Adding match analysis data...\n');
  
  try {
    // Get admin user for author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found, skipping analysis creation');
      return;
    }
    
    // Get today's matches for analysis
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const todayMatches = await prisma.match.findMany({
      where: {
        scheduledTime: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      take: 3
    });
    
    console.log(`Found ${todayMatches.length} matches for today`);
    
    // Create analysis for Liverpool vs Bournemouth (Aug 15)
    const slug1 = 'liverpool-vs-bournemouth-2025-08-15';
    const existing1 = await prisma.sportAnalysis.findUnique({
      where: { slug: slug1 }
    });
    
    if (!existing1) {
      await prisma.sportAnalysis.create({
        data: {
          authorId: adminUser.id,
          matchDate: new Date('2025-08-15T14:00:00Z'),
          sportType: 'SOCCER',
          league: 'Premier League',
          competition: 'Premier League 2025-26',
          homeTeam: 'Liverpool',
          awayTeam: 'AFC Bournemouth',
          title: '리버풀 vs 본머스 - 프리미어리그 개막전 분석',
          slug: slug1,
          metaDescription: '2025-26 프리미어리그 개막전, 리버풀이 홈에서 본머스를 맞이합니다. AI 경기 분석과 예측.',
          metaKeywords: ['리버풀', '본머스', '프리미어리그', '축구분석', '경기예측'],
          homeFormation: '4-3-3',
          awayFormation: '4-4-2',
          homeAnalysis: `리버풀은 지난 시즌 2위로 마감하며 강력한 전력을 보여줬습니다. 
홈 경기에서 특히 강한 모습을 보이며, 안필드의 열기는 팀에게 큰 힘이 됩니다.
살라, 누네스, 맥 알리스터 등 핵심 선수들이 건재하며, 새 시즌 우승을 노립니다.`,
          awayAnalysis: `본머스는 지난 시즌 중위권을 유지하며 안정적인 모습을 보였습니다.
원정 경기에서는 다소 약한 모습을 보였지만, 솔랑케의 득점력은 위협적입니다.
수비 조직력을 강화하고 역습 기회를 노리는 전략을 구사할 것으로 예상됩니다.`,
          tacticalAnalysis: `리버풀은 높은 압박과 빠른 전환을 통해 경기를 지배할 것으로 예상됩니다.
본머스는 수비 블록을 낮게 가져가며 역습 기회를 노릴 것입니다.
중원 싸움이 승부의 관건이 될 것으로 보입니다.`,
          keyPlayers: {
            home: ['모하메드 살라', '다르윈 누네스', '알렉시스 맥 알리스터'],
            away: ['도미닉 솔랑케', '필립 빌링', '루이스 쿡']
          },
          injuryInfo: {
            home: [],
            away: ['타베르니에 (의심)']
          },
          headToHead: {
            total: 10,
            homeWins: 7,
            draws: 2,
            awayWins: 1,
            lastResults: ['4-0', '1-0', '3-1', '2-1', '2-0']
          },
          recentForm: {
            home: ['W', 'W', 'D', 'W', 'L'],
            away: ['W', 'L', 'D', 'D', 'W']
          },
          predictionSummary: '리버풀이 홈 이점과 전력 우위를 바탕으로 승리할 가능성이 높습니다. 2-0 또는 3-1 스코어 예상.',
          confidenceLevel: 4,
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 100)
        }
      });
      console.log('  ✅ Created analysis: Liverpool vs AFC Bournemouth');
    } else {
      console.log('  ⏭️  Analysis already exists: Liverpool vs AFC Bournemouth');
    }
    
    // Create analysis for today's matches if they exist
    if (todayMatches.length > 0) {
      const match1 = todayMatches[0];
      const slug2 = `${match1.homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${match1.awayTeam.toLowerCase().replace(/\s+/g, '-')}-${today.toISOString().split('T')[0]}`;
      
      const existing2 = await prisma.sportAnalysis.findFirst({
        where: { 
          homeTeam: match1.homeTeam,
          awayTeam: match1.awayTeam,
          matchDate: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      });
      
      if (!existing2) {
        await prisma.sportAnalysis.create({
          data: {
            authorId: adminUser.id,
            matchDate: match1.scheduledTime,
            sportType: match1.sportType,
            league: match1.league || 'Premier League',
            competition: match1.competition,
            homeTeam: match1.homeTeam,
            awayTeam: match1.awayTeam,
            title: `${match1.homeTeam} vs ${match1.awayTeam} - 빅매치 분석`,
            slug: slug2,
            metaDescription: `${match1.homeTeam}와 ${match1.awayTeam}의 경기 분석과 AI 예측`,
            metaKeywords: [match1.homeTeam, match1.awayTeam, '프리미어리그', '축구분석'],
            homeFormation: '4-3-3',
            awayFormation: '4-2-3-1',
            homeAnalysis: `${match1.homeTeam}은 홈에서 강한 모습을 보이고 있습니다. 
최근 경기력이 상승세를 타고 있으며, 홈 팬들의 응원이 큰 힘이 될 것입니다.`,
            awayAnalysis: `${match1.awayTeam}은 원정에서도 안정적인 경기력을 보여주고 있습니다.
전술적 유연성과 선수들의 개인 기량이 뛰어납니다.`,
            tacticalAnalysis: '양 팀 모두 공격적인 축구를 구사할 것으로 예상되며, 중원 장악이 승부의 열쇠가 될 것입니다.',
            predictionSummary: '접전이 예상되며, 홈 팀이 근소한 우위를 보일 것으로 예상됩니다.',
            confidenceLevel: 3,
            status: 'PUBLISHED',
            isPublished: true,
            publishedAt: new Date(),
            views: Math.floor(Math.random() * 500),
            likes: Math.floor(Math.random() * 50)
          }
        });
        console.log(`  ✅ Created analysis: ${match1.homeTeam} vs ${match1.awayTeam}`);
      }
    }
    
    // Create analysis for an upcoming match (Aug 16)
    const slug3 = 'aston-villa-vs-newcastle-2025-08-16';
    const existing3 = await prisma.sportAnalysis.findUnique({
      where: { slug: slug3 }
    });
    
    if (!existing3) {
      await prisma.sportAnalysis.create({
        data: {
          authorId: adminUser.id,
          matchDate: new Date('2025-08-16T14:00:00Z'),
          sportType: 'SOCCER',
          league: 'Premier League',
          competition: 'Premier League 2025-26',
          homeTeam: 'Aston Villa',
          awayTeam: 'Newcastle United',
          title: '아스톤 빌라 vs 뉴캐슬 - 주말 빅매치 분석',
          slug: slug3,
          metaDescription: '아스톤 빌라와 뉴캐슬의 프리미어리그 경기. 두 팀의 전력 분석과 AI 예측.',
          metaKeywords: ['아스톤빌라', '뉴캐슬', '프리미어리그', '축구분석'],
          homeFormation: '4-4-2',
          awayFormation: '4-3-3',
          homeAnalysis: `아스톤 빌라는 홈에서 강력한 경기력을 보여주고 있습니다.
에미 마르티네스의 안정적인 골키핑과 왓킨스의 득점력이 팀의 핵심입니다.`,
          awayAnalysis: `뉴캐슬은 지난 시즌 챔피언스리그 진출에 성공하며 상승세를 이어가고 있습니다.
브루노 기마라엥스와 알렉산더 이사크의 활약이 기대됩니다.`,
          predictionSummary: '양 팀 모두 좋은 전력을 갖추고 있어 접전이 예상됩니다. 무승부 가능성이 높습니다.',
          confidenceLevel: 3,
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 800),
          likes: Math.floor(Math.random() * 80)
        }
      });
      console.log('  ✅ Created analysis: Aston Villa vs Newcastle United');
    } else {
      console.log('  ⏭️  Analysis already exists: Aston Villa vs Newcastle United');
    }
    
    // Verify counts
    const analysisCount = await prisma.sportAnalysis.count();
    console.log(`\n📊 Total analyses in database: ${analysisCount}`);
    
    console.log('\n✨ Analysis data added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAnalysisData();