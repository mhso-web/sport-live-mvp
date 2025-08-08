import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function seed20Partners() {
  try {
    console.log('🌱 20개 보증업체 시딩 시작...')

    // 관리자 계정 확인 또는 생성
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@sportslive.com',
          username: 'admin',
          passwordHash: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          level: 99,
          experience: 999999,
        }
      })
      console.log('✅ 관리자 계정 생성됨')
    }

    const partners = [
      {
        name: '스타벳',
        description: '국내 최고 수준의 배당률과 안전한 베팅 환경을 제공하는 메이저 사이트',
        detailContent: '스타벳은 10년 이상의 운영 경험을 바탕으로 안정적인 서비스를 제공합니다.\n\n- 첫충전 100% 보너스\n- 매충전 10% 보너스\n- 24시간 고객센터 운영\n- 5분 내 빠른 환전 처리\n\n업계 최고의 안전성을 자랑합니다.',
        websiteUrl: 'https://example.com/starbet',
        bannerImage: 'https://via.placeholder.com/800x200/1f2937/fbbf24?text=STARBET',
        isActive: true,
        viewCount: 5234,
        createdBy: adminUser.id
      },
      {
        name: '윈윈',
        description: '다양한 스포츠 종목과 실시간 베팅을 지원하는 프리미엄 베팅 플랫폼',
        detailContent: '윈윈은 축구, 농구, 야구, 배구 등 다양한 종목을 지원합니다.\n\n- 첫충전 200% 보너스\n- 업계 최고 라이브 베팅 시스템\n- 실시간 경기 스트리밍\n- 모바일 앱 완벽 지원\n\n최상의 베팅 경험을 제공합니다.',
        websiteUrl: 'https://example.com/winwin',
        bannerImage: 'https://via.placeholder.com/800x200/1e40af/10b981?text=WINWIN',
        isActive: true,
        viewCount: 4523,
        createdBy: adminUser.id
      },
      {
        name: '골드벳',
        description: '첫충전 보너스 100% 지급! 매일 다양한 이벤트가 진행되는 사이트',
        detailContent: '골드벳은 신규 회원에게 최대 100만원까지 보너스를 제공합니다.\n\n- 첫충전 100% 보너스 (최대 100만원)\n- 매일 출석 체크 이벤트\n- 주간 페이백 10%\n- VIP 전용 혜택\n\n풍성한 이벤트와 혜택을 경험하세요.',
        websiteUrl: 'https://example.com/goldbet',
        bannerImage: 'https://via.placeholder.com/800x200/b91c1c/fbbf24?text=GOLDBET',
        isActive: true,
        viewCount: 6789,
        createdBy: adminUser.id
      },
      {
        name: '메가스포츠',
        description: '해외 정식 라이센스 보유, 글로벌 스탠다드 베팅 사이트',
        detailContent: '메가스포츠는 정식 게이밍 라이센스를 보유한 합법 베팅 사이트입니다.\n\n- 매충전 10% 보너스\n- 투명한 운영과 공정한 게임\n- 다국어 지원\n- 암호화폐 결제 가능\n\n국제 기준의 안전한 베팅 환경을 제공합니다.',
        websiteUrl: 'https://example.com/megasports',
        bannerImage: 'https://via.placeholder.com/800x200/7c3aed/f59e0b?text=MEGASPORTS',
        isActive: true,
        viewCount: 3456,
        createdBy: adminUser.id
      },
      {
        name: '킹덤',
        description: '무제한 베팅 한도! VIP 회원 특별 혜택 제공',
        detailContent: '킹덤은 베팅 한도 제한이 없어 하이롤러들에게 인기가 높습니다.\n\n- 베팅 한도 무제한\n- VIP 전담 매니저\n- 특별 보너스 협의 가능\n- 최우선 출금 처리\n\n프리미엄 베팅 서비스를 경험하세요.',
        websiteUrl: 'https://example.com/kingdom',
        bannerImage: 'https://via.placeholder.com/800x200/dc2626/fde047?text=KINGDOM',
        isActive: true,
        viewCount: 2890,
        createdBy: adminUser.id
      },
      {
        name: '라이브벳',
        description: '실시간 스트리밍과 함께하는 짜릿한 라이브 베팅',
        detailContent: '라이브벳은 HD급 실시간 스트리밍을 제공합니다.\n\n- HD 실시간 경기 스트리밍\n- 라이브 베팅 전문\n- 모바일 앱 지원\n- 빠른 배당 변경 반영\n\n생생한 경기와 함께 베팅하세요.',
        websiteUrl: 'https://example.com/livebet',
        bannerImage: 'https://via.placeholder.com/800x200/059669/34d399?text=LIVEBET',
        isActive: true,
        viewCount: 4123,
        createdBy: adminUser.id
      },
      {
        name: '챔피언',
        description: '프로 베터들이 선택한 No.1 베팅 사이트',
        detailContent: '챔피언은 전문 베터들 사이에서 가장 신뢰받는 사이트입니다.\n\n- 정확한 통계 제공\n- 전문가 분석 자료\n- 높은 배당률\n- 안정적인 시스템\n\n프로들의 선택, 챔피언입니다.',
        websiteUrl: 'https://example.com/champion',
        bannerImage: 'https://via.placeholder.com/800x200/ea580c/fed7aa?text=CHAMPION',
        isActive: true,
        viewCount: 5678,
        createdBy: adminUser.id
      },
      {
        name: '벳365',
        description: '세계 최대 규모의 온라인 베팅 플랫폼',
        detailContent: '벳365는 전 세계 200개국 이상에서 서비스되는 글로벌 플랫폼입니다.\n\n- 전 세계 모든 경기 베팅 가능\n- 다양한 베팅 옵션\n- 안정적인 시스템\n- 24시간 글로벌 지원\n\n세계가 인정한 베팅 사이트입니다.',
        websiteUrl: 'https://example.com/bet365',
        bannerImage: 'https://via.placeholder.com/800x200/16a34a/86efac?text=BET365',
        isActive: true,
        viewCount: 9876,
        createdBy: adminUser.id
      },
      {
        name: '슈퍼벳',
        description: '매충 10% 보너스! 페이백 이벤트 상시 진행',
        detailContent: '슈퍼벳은 매 충전마다 10% 보너스를 제공합니다.\n\n- 매충전 10% 보너스\n- 주간 페이백 이벤트\n- 손실금 5% 환급\n- 친구 추천 보너스\n\n끊임없는 혜택을 받아보세요.',
        websiteUrl: 'https://example.com/superbet',
        bannerImage: 'https://via.placeholder.com/800x200/0891b2/67e8f9?text=SUPERBET',
        isActive: true,
        viewCount: 3210,
        createdBy: adminUser.id
      },
      {
        name: '로얄카지노',
        description: '스포츠베팅과 카지노를 동시에! 올인원 게이밍 플랫폼',
        detailContent: '로얄카지노는 스포츠베팅과 카지노를 한 곳에서 즐길 수 있습니다.\n\n- 스포츠베팅 + 라이브 카지노\n- 슬롯 게임 1000종 이상\n- 통합 지갑 시스템\n- 크로스 보너스 제공\n\n다양한 게임을 한 곳에서 즐기세요.',
        websiteUrl: 'https://example.com/royal',
        bannerImage: 'https://via.placeholder.com/800x200/9333ea/c084fc?text=ROYAL',
        isActive: true,
        viewCount: 4567,
        createdBy: adminUser.id
      },
      {
        name: '맥스벳',
        description: '업계 최고 배당률! 스포츠 전문 베팅 사이트',
        detailContent: '맥스벳은 경쟁사 대비 평균 5% 높은 배당률을 제공합니다.\n\n- 업계 최고 배당률\n- 스포츠 베팅 전문\n- 상세한 경기 분석\n- 빠른 정산 시스템\n\n최고의 배당률을 경험하세요.',
        websiteUrl: 'https://example.com/maxbet',
        bannerImage: 'https://via.placeholder.com/800x200/db2777/fbbf24?text=MAXBET',
        isActive: true,
        viewCount: 5432,
        createdBy: adminUser.id
      },
      {
        name: '플래티넘',
        description: 'VIP 전용 프리미엄 베팅 서비스',
        detailContent: '플래티넘은 고액 베터를 위한 프리미엄 서비스입니다.\n\n- VIP 전담 매니저\n- 최우선 출금 처리\n- 특별 보너스 제공\n- 프라이빗 이벤트\n\nVIP만을 위한 특별한 서비스를 경험하세요.',
        websiteUrl: 'https://example.com/platinum',
        bannerImage: 'https://via.placeholder.com/800x200/4b5563/e5e7eb?text=PLATINUM',
        isActive: true,
        viewCount: 2345,
        createdBy: adminUser.id
      },
      {
        name: '에이스',
        description: '신속한 입출금! 5분 내 처리 보장',
        detailContent: '에이스는 업계 최속 입출금 시스템을 자랑합니다.\n\n- 5분 내 출금 처리\n- 365일 24시간 운영\n- 자동 입금 확인\n- 다양한 입출금 방법\n\n빠르고 안전한 거래를 보장합니다.',
        websiteUrl: 'https://example.com/ace',
        bannerImage: 'https://via.placeholder.com/800x200/ef4444/fca5a5?text=ACE',
        isActive: true,
        viewCount: 6543,
        createdBy: adminUser.id
      },
      {
        name: '다이아몬드',
        description: '10년 무사고 운영! 가장 안전한 베팅 사이트',
        detailContent: '다이아몬드는 10년간 단 한 번의 사고 없이 운영되었습니다.\n\n- 10년 무사고 운영\n- 100% 안전 보장\n- 투명한 운영 정책\n- 강력한 보안 시스템\n\n최고의 안전성을 자랑합니다.',
        websiteUrl: 'https://example.com/diamond',
        bannerImage: 'https://via.placeholder.com/800x200/06b6d4/a5f3fc?text=DIAMOND',
        isActive: true,
        viewCount: 7890,
        createdBy: adminUser.id
      },
      {
        name: '빅윈',
        description: '잭팟 이벤트! 매주 1억원 상당 경품 추첨',
        detailContent: '빅윈은 매주 1억원 상당의 경품을 추첨합니다.\n\n- 매주 1억원 경품 추첨\n- 베팅만 해도 자동 응모\n- 다양한 경품 제공\n- 당첨 확률 UP 이벤트\n\n대박의 기회를 잡으세요.',
        websiteUrl: 'https://example.com/bigwin',
        bannerImage: 'https://via.placeholder.com/800x200/f59e0b/fef3c7?text=BIGWIN',
        isActive: true,
        viewCount: 4321,
        createdBy: adminUser.id
      },
      {
        name: '썬더',
        description: '번개처럼 빠른 베팅! 원클릭 시스템',
        detailContent: '썬더는 혁신적인 원클릭 베팅 시스템을 제공합니다.\n\n- 원클릭 베팅 시스템\n- 초고속 베팅 처리\n- 간편한 인터페이스\n- 모바일 최적화\n\n빠르고 편리한 베팅을 경험하세요.',
        websiteUrl: 'https://example.com/thunder',
        bannerImage: 'https://via.placeholder.com/800x200/8b5cf6/ddd6fe?text=THUNDER',
        isActive: true,
        viewCount: 3678,
        createdBy: adminUser.id
      },
      {
        name: '올스타',
        description: '모든 스포츠를 한곳에! 종합 스포츠 베팅',
        detailContent: '올스타는 전 세계 모든 스포츠 경기를 다룹니다.\n\n- 50개 이상 스포츠 종목\n- 전 세계 모든 리그\n- e스포츠 포함\n- 가상 스포츠 지원\n\n모든 스포츠를 한 곳에서 즐기세요.',
        websiteUrl: 'https://example.com/allstar',
        bannerImage: 'https://via.placeholder.com/800x200/10b981/bbf7d0?text=ALLSTAR',
        isActive: true,
        viewCount: 5234,
        createdBy: adminUser.id
      },
      {
        name: '프로벳',
        description: '전문가 픽 제공! AI 분석 시스템 도입',
        detailContent: '프로벳은 AI 기반 분석 시스템을 제공합니다.\n\n- AI 경기 분석\n- 전문가 픽 제공\n- 승률 예측 시스템\n- 데이터 기반 베팅\n\n과학적인 베팅을 시작하세요.',
        websiteUrl: 'https://example.com/probet',
        bannerImage: 'https://via.placeholder.com/800x200/3b82f6/bfdbfe?text=PROBET',
        isActive: true,
        viewCount: 4567,
        createdBy: adminUser.id
      },
      {
        name: '럭키',
        description: '행운의 보너스! 매일 룰렛 이벤트',
        detailContent: '럭키는 매일 진행되는 룰렛 이벤트로 보너스를 제공합니다.\n\n- 매일 룰렛 이벤트\n- 행운의 보너스\n- 깜짝 선물 제공\n- 더블 찬스 이벤트\n\n행운을 시험해보세요.',
        websiteUrl: 'https://example.com/lucky',
        bannerImage: 'https://via.placeholder.com/800x200/22c55e/86efac?text=LUCKY',
        isActive: true,
        viewCount: 3890,
        createdBy: adminUser.id
      },
      {
        name: '엠파이어',
        description: '제국을 건설하라! 레벨업 시스템 도입',
        detailContent: '엠파이어는 독특한 레벨업 시스템을 제공합니다.\n\n- 레벨업 시스템\n- 레벨별 보너스 지급\n- 경험치 적립\n- VIP 레벨 승급\n\n베팅하며 성장하는 재미를 느껴보세요.',
        websiteUrl: 'https://example.com/empire',
        bannerImage: 'https://via.placeholder.com/800x200/a855f7/f3e8ff?text=EMPIRE',
        isActive: true,
        viewCount: 4123,
        createdBy: adminUser.id
      }
    ]

    // 기존 파트너 삭제 (선택사항)
    // await prisma.partner.deleteMany({})
    // console.log('🗑️  기존 파트너 데이터 삭제됨')

    // 파트너 생성
    for (const partner of partners) {
      const created = await prisma.partner.upsert({
        where: { name: partner.name },
        update: partner,
        create: partner
      })
      console.log(`✅ 파트너 생성/업데이트됨: ${created.name}`)

      // 각 파트너에 대해 랜덤 평점 생성 (3-5개)
      const ratingCount = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < ratingCount; i++) {
        // 더미 사용자 생성 또는 기존 사용자 사용
        let user = await prisma.user.findFirst({
          where: { 
            email: `user${i + 1}@example.com` 
          }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: `user${i + 1}@example.com`,
              username: `user${i + 1}`,
              passwordHash: await bcrypt.hash('password123', 10),
              role: 'USER',
              level: Math.floor(Math.random() * 50) + 1,
              experience: Math.floor(Math.random() * 10000),
            }
          })
        }

        // 기존 평점이 없는 경우에만 생성
        const existingRating = await prisma.partnerRating.findUnique({
          where: {
            partnerId_userId: {
              partnerId: created.id,
              userId: user.id
            }
          }
        })

        if (!existingRating) {
          await prisma.partnerRating.create({
            data: {
              partnerId: created.id,
              userId: user.id,
              rating: Math.floor(Math.random() * 2) + 4, // 4-5점
            }
          })
        }
      }

      // 각 파트너에 대해 랜덤 댓글 생성 (2-5개)
      const commentCount = Math.floor(Math.random() * 4) + 2
      for (let i = 0; i < commentCount; i++) {
        const user = await prisma.user.findFirst({
          where: { email: `user${Math.floor(Math.random() * 5) + 1}@example.com` }
        })

        if (user) {
          await prisma.partnerComment.create({
            data: {
              partnerId: created.id,
              userId: user.id,
              content: [
                '정말 안전한 업체입니다. 추천해요!',
                '빠른 환전이 인상적이네요',
                '이벤트가 많아서 좋습니다',
                '고객센터 응대가 친절해요',
                '오래된 업체라 믿을만합니다',
                '첫충 보너스가 매력적이네요',
                '모바일에서도 잘 작동합니다',
                '인터페이스가 깔끔해서 좋아요',
                '배당률이 높아서 만족합니다',
                '출금이 빠르고 안전해요',
                '신뢰할 수 있는 사이트입니다',
                '매충 보너스가 좋네요',
              ][Math.floor(Math.random() * 12)],
            }
          })
        }
      }
    }

    console.log('✅ 모든 파트너 데이터 시딩 완료!')
    console.log(`총 ${partners.length}개의 파트너가 생성되었습니다.`)

  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
seed20Partners()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })