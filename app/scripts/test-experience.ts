import { PrismaClient } from '@prisma/client'
import { ExperienceService } from '../lib/services/experienceService'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing experience system...')
  
  // test01 사용자로 테스트
  const user = await prisma.user.findUnique({
    where: { username: 'test01' },
    select: { id: true, experience: true, level: true }
  })
  
  if (!user) {
    console.error('test01 user not found!')
    return
  }
  
  console.log(`\nBefore: ${user.username} - Level ${user.level}, ${user.experience} XP`)
  
  // 게시글 작성 경험치 테스트
  console.log('\n1. Testing POST_CREATE (10 XP)...')
  const result1 = await ExperienceService.awardExperience(user.id, 'POST_CREATE', {
    postId: 999,
    boardType: 'COMMUNITY'
  })
  console.log(`Result: +${result1.experienceGained} XP, New total: ${result1.newTotalExperience} XP`)
  if (result1.leveledUp) {
    console.log(`🎉 LEVEL UP! ${result1.previousLevel} → ${result1.newLevel}`)
  }
  
  // 댓글 작성 경험치 테스트
  console.log('\n2. Testing COMMENT_CREATE (5 XP)...')
  const result2 = await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE', {
    commentId: 999,
    postId: 999
  })
  console.log(`Result: +${result2.experienceGained} XP, New total: ${result2.newTotalExperience} XP`)
  
  // 좋아요 경험치 테스트
  console.log('\n3. Testing POST_LIKE (2 XP)...')
  const result3 = await ExperienceService.awardExperience(user.id, 'POST_LIKE', {
    postId: 999
  })
  console.log(`Result: +${result3.experienceGained} XP, New total: ${result3.newTotalExperience} XP`)
  
  // 최종 상태
  const finalUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { username: true, level: true, experience: true }
  })
  
  if (finalUser) {
    const progress = ExperienceService.calculateLevelProgress(finalUser.experience, finalUser.level)
    console.log(`\nFinal: ${finalUser.username} - Level ${finalUser.level}, ${finalUser.experience} XP (${progress}% to next level)`)
  }
  
  // 경험치 로그 확인
  const logs = await prisma.userExperienceLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  console.log('\nRecent experience logs:')
  logs.forEach(log => {
    console.log(`- ${log.actionType}: +${log.experienceGained} XP (${log.description})`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })