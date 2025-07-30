import { PrismaClient } from '@prisma/client'
import { ExperienceService } from '../lib/services/experienceService'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding experience data...')
  
  // 테스트 사용자들 가져오기
  const users = await prisma.user.findMany({
    where: {
      username: {
        in: ['test01', 'sports_fan', 'baseball_pro', 'soccer_lover', 'admin']
      }
    }
  })
  
  for (const user of users) {
    console.log(`\nProcessing user: ${user.username}`)
    
    // 기존 경험치 로그 삭제
    await prisma.userExperienceLog.deleteMany({
      where: { userId: user.id }
    })
    
    // admin 계정 레벨 조정
    if (user.username === 'admin') {
      // admin은 적당한 레벨로 재설정
      await prisma.user.update({
        where: { id: user.id },
        data: { experience: 5000, level: 10 }
      })
      continue
    }
    
    // 다양한 활동 시뮬레이션
    if (user.username === 'sports_fan') {
      // 활발한 사용자
      await ExperienceService.awardExperience(user.id, 'PROFILE_COMPLETE')
      await ExperienceService.awardExperience(user.id, 'FIRST_POST')
      
      // 여러 게시글 작성
      for (let i = 0; i < 10; i++) {
        await ExperienceService.awardExperience(user.id, 'POST_CREATE')
      }
      
      // 여러 댓글 작성
      for (let i = 0; i < 20; i++) {
        await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE')
      }
      
      // 좋아요 활동
      for (let i = 0; i < 15; i++) {
        await ExperienceService.awardExperience(user.id, 'POST_LIKE')
      }
      
      // 좋아요 받음
      for (let i = 0; i < 30; i++) {
        await ExperienceService.awardExperience(user.id, 'RECEIVED_LIKE')
      }
      
      // 일일 로그인 (최근 7일)
      for (let i = 0; i < 7; i++) {
        await ExperienceService.awardExperience(user.id, 'DAILY_LOGIN')
      }
      
      // 인기 게시글
      await ExperienceService.awardExperience(user.id, 'POST_VIEWS_100')
      await ExperienceService.awardExperience(user.id, 'POST_VIEWS_1000')
    } else if (user.username === 'baseball_pro') {
      // 보통 활동 사용자
      await ExperienceService.awardExperience(user.id, 'FIRST_POST')
      
      for (let i = 0; i < 5; i++) {
        await ExperienceService.awardExperience(user.id, 'POST_CREATE')
      }
      
      for (let i = 0; i < 10; i++) {
        await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE')
      }
      
      for (let i = 0; i < 5; i++) {
        await ExperienceService.awardExperience(user.id, 'RECEIVED_LIKE')
      }
    } else if (user.username === 'soccer_lover') {
      // 일반 사용자
      await ExperienceService.awardExperience(user.id, 'PROFILE_COMPLETE')
      
      for (let i = 0; i < 3; i++) {
        await ExperienceService.awardExperience(user.id, 'POST_CREATE')
      }
      
      for (let i = 0; i < 50; i++) {
        await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE')
      }
    } else if (user.username === 'test01') {
      // 신규 사용자
      await ExperienceService.awardExperience(user.id, 'FIRST_POST')
      
      for (let i = 0; i < 2; i++) {
        await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE')
      }
    }
    
    // 최종 사용자 정보 출력
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        level: true,
        experience: true
      }
    })
    
    if (updatedUser) {
      const progress = ExperienceService.calculateLevelProgress(updatedUser.experience, updatedUser.level)
      console.log(`${updatedUser.username}: Level ${updatedUser.level}, ${updatedUser.experience} XP (${progress}% to next level)`)
    }
  }
  
  console.log('\nExperience data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })