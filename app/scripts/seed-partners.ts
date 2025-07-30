import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding partners...')

  // 관리자 계정 찾기
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    console.error('Admin user not found!')
    return
  }

  // 테스트 보증업체 생성
  const partners = [
    {
      name: '스포츠토토 공식',
      description: '안전하고 신뢰할 수 있는 스포츠 베팅 플랫폼',
      detailContent: `
# 스포츠토토 공식 파트너

## 서비스 소개
스포츠토토는 20년 전통의 안전한 스포츠 베팅 플랫폼입니다.

## 주요 특징
- ✅ 정부 인가 업체
- ✅ 24시간 고객 지원
- ✅ 다양한 스포츠 종목 지원
- ✅ 실시간 경기 중계 제공

## 이용 안내
1. 회원가입 후 본인인증
2. 충전 후 베팅 진행
3. 당첨금 즉시 출금 가능

## 고객센터
- 전화: 1588-1234
- 이메일: support@sportstoto.com
      `,
      websiteUrl: 'https://sportstoto.example.com',
      bannerImage: '/images/partners/sportstoto.jpg',
      viewCount: 1250
    },
    {
      name: '라이브스코어 프로',
      description: '실시간 스포츠 정보와 분석을 제공하는 전문 플랫폼',
      detailContent: `
# 라이브스코어 프로

## 서비스 소개
전 세계 모든 스포츠 경기의 실시간 스코어와 통계를 제공합니다.

## 주요 기능
- 📊 실시간 경기 스코어
- 📈 상세 통계 분석
- 🔔 경기 알림 서비스
- 💬 전문가 경기 분석

## 제공 종목
- 축구, 야구, 농구, 배구
- e스포츠, 테니스, 골프 등

## 파트너 혜택
스포츠 라이브 회원 전용 30% 할인
      `,
      websiteUrl: 'https://livescore.example.com',
      bannerImage: '/images/partners/livescore.jpg',
      viewCount: 980
    },
    {
      name: 'AI 스포츠 분석센터',
      description: '인공지능 기반 스포츠 경기 예측 및 분석 서비스',
      detailContent: `
# AI 스포츠 분석센터

## 첨단 AI 기술로 스포츠를 분석합니다

### 서비스 특징
- 🤖 딥러닝 기반 경기 예측
- 📊 빅데이터 분석
- 🎯 85% 이상의 예측 정확도
- 📱 모바일 앱 지원

### 분석 항목
1. 팀 전력 분석
2. 선수 컨디션 예측
3. 경기 결과 예측
4. 실시간 승부 예측

### 이용 요금
- 무료: 기본 분석 제공
- 프리미엄: 월 29,900원
- VIP: 월 59,900원
      `,
      websiteUrl: 'https://aisports.example.com',
      bannerImage: '/images/partners/aisports.jpg',
      viewCount: 756
    },
    {
      name: '스포츠 중계 플러스',
      description: '고화질 스포츠 중계와 하이라이트 영상 제공',
      detailContent: `
# 스포츠 중계 플러스

## 최고의 스포츠 중계 서비스

### 🎥 서비스 특징
- **4K 고화질** 실시간 중계
- **다중 화면** 동시 시청 지원
- **모든 디바이스** 호환
- **광고 없는** 프리미엄 시청

### 📺 중계 종목
| 종목 | 리그 | 중계 수 |
|------|------|---------|
| 축구 | 프리미어리그, K리그 | 주 50경기 |
| 야구 | KBO, MLB | 주 40경기 |
| 농구 | KBL, NBA | 주 30경기 |
| e스포츠 | LCK, VCT | 주 20경기 |

### 💰 이용 요금
- 기본: 월 9,900원
- 프리미엄: 월 19,900원
- VIP: 월 29,900원

### 🎁 스포츠 라이브 회원 혜택
**첫 달 50% 할인 + 3개월 이용 시 1개월 무료**
      `,
      websiteUrl: 'https://sportsplus.example.com',
      bannerImage: '/images/partners/sportsplus.jpg',
      viewCount: 1832
    },
    {
      name: '챔피언 베팅',
      description: '안전한 스포츠 베팅과 높은 배당률 제공',
      detailContent: `
# 챔피언 베팅

## 🏆 승리를 위한 최고의 선택

### 왜 챔피언 베팅인가?
1. **업계 최고 배당률** - 타사 대비 5~10% 높은 배당
2. **즉시 출금** - 당첨금 5분 내 출금 완료
3. **안전 보장** - 100% 보증금 예치
4. **24/7 고객지원** - 연중무휴 실시간 상담

### 🎮 베팅 가능 종목
- ⚽ 축구: 전 세계 200개 리그
- ⚾ 야구: KBO, MLB, NPB
- 🏀 농구: KBL, NBA, 유로리그
- 🎯 e스포츠: LoL, 발로란트, 오버워치
- 🎾 테니스, 골프, 배구 등

### 💎 VIP 혜택
- 베팅 한도 무제한
- 전용 매니저 배정
- 특별 보너스 지급
- 프리미엄 분석 자료 제공

### 🔒 안전성
- 정식 라이선스 보유
- SSL 암호화 적용
- 개인정보 완벽 보호

### 📞 고객센터
- 카카오톡: @champion
- 전화: 1566-7777
- 이메일: help@champion.com
      `,
      websiteUrl: 'https://champion.example.com',
      bannerImage: '/images/partners/champion.jpg',
      viewCount: 2156
    }
  ]

  for (const partner of partners) {
    const created = await prisma.partner.upsert({
      where: { name: partner.name },
      update: {
        ...partner,
        createdBy: admin.id
      },
      create: {
        ...partner,
        createdBy: admin.id
      }
    })

    // 기존 평점이 있는지 확인
    const existingRating = await prisma.partnerRating.findFirst({
      where: { partnerId: created.id }
    })

    // 평점이 없을 때만 테스트 평점 추가
    if (!existingRating) {
      // 테스트 사용자로 평점 추가
      const testUser = await prisma.user.findFirst({
        where: { username: 'testuser' }
      })
      
      if (testUser) {
        await prisma.partnerRating.create({
          data: {
            partnerId: created.id,
            userId: testUser.id,
            rating: Math.floor(Math.random() * 2) + 4 // 4-5점
          }
        })
      } else if (admin) {
        // testuser가 없으면 admin으로 평점 추가
        await prisma.partnerRating.create({
          data: {
            partnerId: created.id,
            userId: admin.id,
            rating: Math.floor(Math.random() * 2) + 4 // 4-5점
          }
        })
      }
    }

    console.log(`Created partner: ${created.name}`)
  }

  console.log('Partners seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })