import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

// Analyst personas with unique characteristics
const analysts = [
  {
    username: 'kim_jungseok',
    email: 'jungseok@sportslive.com',
    displayName: '김정석',
    bio: '15년 경력의 스포츠 데이터 분석가. 통계와 세이버메트릭스를 기반으로 한 정확한 예측 전문.',
    specialties: ['SOCCER', 'BASEBALL'],
    description: '빅데이터와 AI를 활용한 스포츠 분석 전문가입니다. KBO와 K리그의 모든 통계를 섭렵하고 있으며, 정확도 72%의 예측률을 자랑합니다.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jungseok',
    averageAccuracy: 72.5,
    isVerified: true,
  },
  {
    username: 'lee_seoyeon',
    email: 'seoyeon@sportslive.com',
    displayName: '이서연',
    bio: '고배당 전문 애널리스트. 언더독의 가능성을 찾아내는 특별한 능력.',
    specialties: ['SOCCER', 'BASKETBALL'],
    description: '역배당과 특별 베팅 전문가. 남들이 보지 못하는 기회를 포착하여 높은 수익률을 추구합니다.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seoyeon',
    averageAccuracy: 65.3,
    isVerified: true,
  },
  {
    username: 'park_minho',
    email: 'minho@sportslive.com',
    displayName: '박민호',
    bio: '전술 분석의 대가. UEFA 라이센스 보유, 전 프로팀 전력분석관.',
    specialties: ['SOCCER'],
    description: '포메이션과 전술 대결을 중심으로 경기를 읽어냅니다. 감독의 의도와 선수들의 움직임을 예측하는 전문가.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minho',
    averageAccuracy: 70.8,
    isVerified: true,
  },
  {
    username: 'choi_eunji',
    email: 'eunji@sportslive.com',
    displayName: '최은지',
    bio: 'e스포츠 전문 분석가. LCK부터 VCT까지 모든 이스포츠를 커버.',
    specialties: ['ESPORTS'],
    description: '프로게이머 출신 e스포츠 애널리스트. 메타 분석과 팀 시너지 예측의 전문가입니다.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eunji',
    averageAccuracy: 68.9,
    isVerified: true,
  },
  {
    username: 'jung_taehoon',
    email: 'taehoon@sportslive.com',
    displayName: '정태훈',
    bio: '30년 스포츠 저널리스트. 역사와 전통을 아는 진정한 스포츠 애널리스트.',
    specialties: ['SOCCER', 'BASEBALL', 'BASKETBALL'],
    description: '클래식 매치와 라이벌전 전문가. 역대 전적과 선수들의 심리를 읽어내는 베테랑 분석가.',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taehoon',
    averageAccuracy: 74.2,
    isVerified: true,
  },
];

// SEO-optimized analysis posts for each analyst
const analysisData = [
  // 김정석 - Data-driven analyses
  {
    analyst: 'kim_jungseok',
    posts: [
      {
        matchDate: new Date('2024-12-30T19:00:00'),
        sportType: 'soccer',
        league: 'K리그1',
        competition: '플레이오프 준결승',
        homeTeam: '울산 현대',
        awayTeam: '전북 현대모터스',
        title: '2024 K리그1 플레이오프 울산 vs 전북 빅데이터 분석 - 72% 정확도 예측',
        metaDescription: 'K리그1 플레이오프 준결승 울산 현대 vs 전북 현대모터스 경기를 빅데이터와 AI로 분석합니다. 양팀 최근 5경기 통계와 상대전적을 기반으로 한 정확한 예측.',
        metaKeywords: ['K리그 플레이오프', '울산 현대', '전북 현대모터스', '축구 분석', '빅데이터 예측', 'K리그 베팅', '축구 통계 분석'],
        homeFormation: '4-2-3-1',
        awayFormation: '4-4-2',
        homeAnalysis: `울산 현대는 최근 5경기에서 평균 1.8골을 기록하며 공격력이 상승세입니다. 
        특히 홈경기에서 승률 78%를 기록 중이며, 주포 스트라이커의 득점률이 0.72골/경기로 리그 최고 수준입니다.
        수비진의 평균 나이가 28.3세로 경험과 체력의 균형이 잘 잡혀있습니다.
        
        통계 분석:
        - 홈 승률: 78% (14승 3무 1패)
        - 평균 득점: 1.8골
        - 평균 실점: 0.9골
        - 코너킥 획득: 5.3개/경기
        - 볼 점유율: 54.2%`,
        awayAnalysis: `전북 현대모터스는 원정 경기에서도 견고한 수비력을 보여주고 있습니다.
        최근 10경기 실점이 8골에 불과하며, 역습 전환 속도가 리그 최고 수준입니다.
        다만 주전 미드필더 부상으로 중원 장악력이 약화된 상태입니다.
        
        통계 분석:
        - 원정 승률: 44% (8승 5무 5패)  
        - 평균 득점: 1.3골
        - 평균 실점: 0.8골
        - 패스 성공률: 82.1%
        - 역습 성공률: 37.8%`,
        tacticalAnalysis: `울산의 4-2-3-1 포메이션이 전북의 4-4-2를 상대로 중원 우위를 가져갈 가능성이 높습니다.
        울산은 측면 공격수들의 움직임으로 전북의 풀백들을 고정시키고, 중앙에서 수적 우위를 만들 것으로 예상됩니다.
        전북은 투톱의 압박으로 울산의 빌드업을 방해하고 역습 기회를 노릴 것입니다.`,
        keyPlayers: {
          home: ['이청용 (공격형 미드필더)', '주니오 (스트라이커)'],
          away: ['구스타보 (스트라이커)', '이승기 (윙어)']
        },
        headToHead: {
          homeWins: 15,
          draws: 12,
          awayWins: 18,
          recentMatches: [
            { date: '2024-10-15', score: '울산 2-1 전북' },
            { date: '2024-07-20', score: '전북 1-1 울산' },
            { date: '2024-05-03', score: '울산 3-2 전북' }
          ]
        },
        recentForm: {
          home: 'WWDWW',
          away: 'DWWLD'
        },
        predictionSummary: `빅데이터 분석 결과 울산 현대가 60% 확률로 승리할 것으로 예측됩니다.
        홈 어드밴티지와 최근 폼, 그리고 전북의 주전 부상이 결정적 요인이 될 것입니다.
        예상 스코어는 울산 2-1 전북이며, 전반전에는 균형을 이루다가 후반전에 울산이 앞서나갈 가능성이 높습니다.`,
        confidenceLevel: 4,
        predictions: [
          {
            betType: 'match_result',
            prediction: '울산 현대 승',
            odds: 2.35,
            stake: 3,
            reasoning: '홈 경기 승률 78%와 최근 5경기 무패 행진을 고려한 예측'
          },
          {
            betType: 'over_under',
            prediction: '언더 2.5',
            odds: 1.85,
            stake: 4,
            reasoning: '플레이오프 중요 경기로 양팀 모두 신중한 경기 운영 예상'
          },
          {
            betType: 'correct_score',
            prediction: '2-1',
            odds: 8.50,
            stake: 1,
            reasoning: '최근 3번의 맞대결 중 2번이 한 골 차 승부'
          }
        ],
        views: 3421,
        likes: 89,
        status: 'published'
      },
      {
        matchDate: new Date('2024-12-28T14:00:00'),
        sportType: 'baseball',
        league: 'KBO',
        homeTeam: 'LG 트윈스',
        awayTeam: 'KT 위즈',
        title: 'KBO 세이버메트릭스 분석: LG vs KT 완벽 예측 가이드 | WAR 지표 활용',
        metaDescription: 'LG 트윈스 vs KT 위즈 경기를 세이버메트릭스로 완벽 분석. WAR, OPS, FIP 등 고급 지표를 활용한 과학적 예측과 베팅 전략 제공.',
        metaKeywords: ['KBO 분석', 'LG 트윈스', 'KT 위즈', '세이버메트릭스', 'WAR 지표', '야구 통계', 'KBO 베팅'],
        homeAnalysis: `LG 트윈스 타선 분석:
        팀 OPS .782 (리그 3위)
        득점 생산력 4.8점/경기
        주루 성공률 73.2%
        
        핵심 타자 WAR:
        - 오스틴 딘: 5.2 WAR, OPS .921
        - 김현수: 3.8 WAR, OPS .845
        - 박동원: 2.1 WAR, 출루율 .382`,
        awayAnalysis: `KT 위즈 투수진 분석:
        팀 ERA 3.92 (리그 5위)
        FIP 4.12 (실제 ERA보다 높음 - 행운 요소)
        WHIP 1.31
        
        선발투수 고영표:
        - FIP 3.78, K/9 7.2
        - 최근 3경기 평균 6이닝, 2.1실점`,
        predictionSummary: `세이버메트릭스 지표상 LG가 65% 우위. 타선의 득점 생산력이 KT 투수진을 압도할 것으로 분석됩니다.`,
        confidenceLevel: 4,
        predictions: [
          {
            betType: 'match_result',
            prediction: 'LG 트윈스 승',
            odds: 1.75,
            stake: 4,
            reasoning: 'WAR 지표와 OPS 우위 기반 예측'
          }
        ],
        views: 2156,
        likes: 67,
        status: 'published'
      }
    ]
  },
  // 이서연 - High-risk specialist
  {
    analyst: 'lee_seoyeon',
    posts: [
      {
        matchDate: new Date('2024-12-29T20:00:00'),
        sportType: 'basketball',
        league: 'KBL',
        homeTeam: '서울 SK나이츠',
        awayTeam: '안양 KGC',
        title: '🔥역배당 특급 예측! 안양 KGC의 서울 원정 대반전 시나리오 | 배당 3.85',
        metaDescription: '서울 SK vs 안양 KGC 역배당 분석. 언더독 안양의 숨겨진 강점과 서울의 약점을 파헤쳐 고배당 기회를 제공합니다.',
        metaKeywords: ['KBL 역배당', '고배당 베팅', '안양 KGC', '서울 SK', '농구 언더독', 'KBL 분석'],
        homeAnalysis: `서울 SK의 숨겨진 약점:
        - 최근 3경기 4쿼터 평균 실점 28.3점 (리그 최악)
        - 주전 가드 부상으로 백업 출전
        - 연속 경기 피로도 누적 (3일 연속 경기)`,
        awayAnalysis: `안양 KGC의 반전 요소:
        - 새 용병 합류 후 2연승 중
        - 원정 경기 언더독 승률 41% (리그 최고)
        - 속공 득점 리그 1위`,
        predictionSummary: `모두가 서울을 선택할 때, 안양의 대반전을 예측합니다! 3.85 배당의 가치가 충분합니다.`,
        confidenceLevel: 3,
        predictions: [
          {
            betType: 'match_result',
            prediction: '안양 KGC 승',
            odds: 3.85,
            stake: 2,
            reasoning: '고배당 가치 베팅, 서울의 피로도와 안양의 상승세'
          },
          {
            betType: 'handicap',
            prediction: '안양 +7.5',
            odds: 1.90,
            stake: 4,
            reasoning: '큰 점수 차는 나지 않을 것으로 예상'
          }
        ],
        views: 4532,
        likes: 124,
        status: 'published'
      }
    ]
  },
  // 박민호 - Tactical expert
  {
    analyst: 'park_minho',
    posts: [
      {
        matchDate: new Date('2024-12-31T20:00:00'),
        sportType: 'soccer',
        league: '프리미어리그',
        homeTeam: '맨체스터 시티',
        awayTeam: '리버풀',
        title: '펩 vs 클롭 전술 대결 완벽 분석 | 맨시티 가변 포메이션의 비밀',
        metaDescription: '맨체스터 시티 vs 리버풀 빅매치 전술 분석. 펩 과르디올라와 클롭의 전술 대결을 상세히 풀어냅니다.',
        metaKeywords: ['프리미어리그', '맨시티 리버풀', '펩 과르디올라', '전술 분석', '포메이션'],
        homeFormation: '3-2-4-1',
        awayFormation: '4-3-3',
        homeAnalysis: `펩의 포지셔널 플레이:
        - 수비시 4-3-3, 공격시 3-2-4-1 가변
        - 인버티드 풀백 활용한 중원 장악
        - False 9 홀란드의 드롭으로 공간 창출`,
        awayAnalysis: `클롭의 게겐프레싱:
        - 높은 수비라인과 압박
        - 풀백들의 오버래핑으로 측면 공략
        - 살라와 디아스의 역습 전환`,
        tacticalAnalysis: `핵심은 중원 싸움입니다. 맨시티가 수적 우위를 만들려 하지만, 리버풀의 압박 강도가 변수가 될 것입니다.`,
        predictionSummary: `전술적으로 맨시티가 약간 우위지만, 리버풀의 역습이 위협적입니다. 접전 예상.`,
        confidenceLevel: 4,
        predictions: [
          {
            betType: 'match_result',
            prediction: '무승부',
            odds: 3.40,
            stake: 2,
            reasoning: '빅매치 전술 대결은 신중한 경기 운영으로 무승부 가능성 높음'
          }
        ],
        views: 5234,
        likes: 201,
        status: 'published'
      }
    ]
  },
  // 최은지 - Esports specialist
  {
    analyst: 'choi_eunji',
    posts: [
      {
        matchDate: new Date('2025-01-02T17:00:00'),
        sportType: 'esports',
        league: 'LCK',
        competition: 'LCK Spring 2025',
        homeTeam: 'T1',
        awayTeam: 'GEN.G',
        title: 'LCK Spring 2025 T1 vs GEN.G 완벽 분석 | 메타 변화와 팀 시너지',
        metaDescription: 'LCK 개막전 T1 vs GEN.G 분석. 새 시즌 메타와 로스터 변화를 반영한 전문가 예측.',
        metaKeywords: ['LCK 2025', 'T1', 'GEN.G', '롤 챔스', 'e스포츠 베팅', 'LCK 분석'],
        homeAnalysis: `T1 시즌 준비도:
        - 페이커 400번째 LCK 경기
        - 새 서포터 영입으로 봇 라인 강화
        - 스크림 승률 73%`,
        awayAnalysis: `GEN.G 팀 상태:
        - 탑-정글 시너지 리그 최고
        - 새 메타 적응도 높음
        - 오브젝트 컨트롤 능력 탁월`,
        predictionSummary: `T1의 홈 어드밴티지와 팬 지원이 승부를 가를 것입니다. 2-1 T1 승리 예측.`,
        confidenceLevel: 4,
        predictions: [
          {
            betType: 'match_result',
            prediction: 'T1 승 (2-1)',
            odds: 2.20,
            stake: 3,
            reasoning: '홈 경기 버프와 새 로스터 시너지'
          }
        ],
        views: 8923,
        likes: 456,
        status: 'published'
      }
    ]
  },
  // 정태훈 - Veteran analyst
  {
    analyst: 'jung_taehoon',
    posts: [
      {
        matchDate: new Date('2025-01-01T15:00:00'),
        sportType: 'soccer',
        league: 'K리그1',
        competition: '슈퍼매치',
        homeTeam: 'FC 서울',
        awayTeam: '수원 삼성',
        title: '2025 신년 슈퍼매치 역사적 분석 | FC서울 vs 수원 30년 라이벌전',
        metaDescription: '한국 축구 최대 라이벌전 FC서울 vs 수원삼성. 30년 역사와 전통을 바탕으로 한 깊이 있는 분석.',
        metaKeywords: ['슈퍼매치', 'FC서울', '수원삼성', 'K리그 더비', '서울 수원 라이벌'],
        homeAnalysis: `FC서울의 슈퍼매치 DNA:
        - 역대 슈퍼매치 승률 52%
        - 홈 경기 무패 행진 8경기
        - 신년 경기 승률 71%
        
        정신력과 전통의 힘이 발휘되는 경기`,
        awayAnalysis: `수원의 반란 시나리오:
        - 최근 원정 슈퍼매치 2연승
        - 새 감독 부임 후 전술 변화
        - 젊은 선수들의 패기`,
        predictionSummary: `역사는 반복됩니다. 신년 슈퍼매치는 FC서울이 전통의 힘으로 승리할 것입니다.`,
        confidenceLevel: 5,
        predictions: [
          {
            betType: 'match_result',
            prediction: 'FC서울 승',
            odds: 2.10,
            stake: 4,
            reasoning: '30년 슈퍼매치 역사상 신년 경기는 홈팀 우위'
          }
        ],
        views: 6234,
        likes: 298,
        status: 'published'
      }
    ]
  }
];

async function seedAnalysts() {
  console.log('🌱 Starting analyst seed...');
  
  try {
    // Create users and analyst profiles
    for (const analyst of analysts) {
      console.log(`Creating analyst: ${analyst.displayName}`);
      
      // Create user
      const hashedPassword = await bcrypt.hash('analyst123!', 10);
      const user = await prisma.user.upsert({
        where: { email: analyst.email },
        update: {},
        create: {
          username: analyst.username,
          email: analyst.email,
          passwordHash: hashedPassword,
          role: 'ANALYST',
          bio: analyst.bio,
          experience: 5000,
          level: 10,
          isActive: true,
        }
      });
      
      // Create analyst profile
      await prisma.analystProfile.upsert({
        where: { userId: user.id },
        update: {
          displayName: analyst.displayName,
          specialties: analyst.specialties,
          description: analyst.description,
          profileImage: analyst.profileImage,
          averageAccuracy: analyst.averageAccuracy,
          isVerified: analyst.isVerified,
        },
        create: {
          userId: user.id,
          displayName: analyst.displayName,
          specialties: analyst.specialties,
          description: analyst.description,
          profileImage: analyst.profileImage,
          averageAccuracy: analyst.averageAccuracy,
          isVerified: analyst.isVerified,
        }
      });
      
      console.log(`✅ Created analyst: ${analyst.displayName}`);
    }
    
    // Create analysis posts
    for (const analystData of analysisData) {
      const user = await prisma.user.findUnique({
        where: { username: analystData.analyst }
      });
      
      if (!user) {
        console.error(`User not found: ${analystData.analyst}`);
        continue;
      }
      
      for (const post of analystData.posts) {
        console.log(`Creating analysis: ${post.title}`);
        
        // Generate unique slug
        const baseSlug = slugify(
          `${post.matchDate.toISOString().split('T')[0]}-${post.homeTeam}-vs-${post.awayTeam}`,
          { lower: true, strict: true }
        );
        
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.sportAnalysis.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Create the analysis
        const analysis = await prisma.sportAnalysis.create({
          data: {
            authorId: user.id,
            matchDate: post.matchDate,
            sportType: post.sportType.toUpperCase() as any,
            league: post.league,
            competition: post.competition,
            homeTeam: post.homeTeam,
            awayTeam: post.awayTeam,
            slug,
            title: post.title,
            metaDescription: post.metaDescription,
            metaKeywords: post.metaKeywords,
            homeFormation: post.homeFormation,
            awayFormation: post.awayFormation,
            homeAnalysis: post.homeAnalysis,
            awayAnalysis: post.awayAnalysis,
            tacticalAnalysis: post.tacticalAnalysis,
            keyPlayers: post.keyPlayers || {},
            headToHead: post.headToHead || {},
            recentForm: post.recentForm || {},
            predictionSummary: post.predictionSummary,
            confidenceLevel: post.confidenceLevel,
            views: post.views || 0,
            likes: post.likes || 0,
            status: (post.status?.toUpperCase() || 'PUBLISHED') as any,
            publishedAt: new Date(),
          }
        });
        
        // Create predictions
        for (const prediction of post.predictions) {
          await prisma.analysisPrediction.create({
            data: {
              analysis: {
                connect: { id: analysis.id }
              },
              author: {
                connect: { id: user.id }
              },
              betType: prediction.betType.toUpperCase().replace(' ', '_') as any,
              prediction: prediction.prediction,
              odds: prediction.odds,
              stake: prediction.stake,
              reasoning: prediction.reasoning,
            }
          });
        }
        
        console.log(`✅ Created analysis: ${post.title}`);
      }
    }
    
    console.log('✅ Analyst seed completed successfully!');
    
  } catch (error) {
    console.error('Error seeding analysts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedAnalysts()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });