import { PrismaClient } from '@prisma/client'
import { ExperienceService } from '../lib/services/experienceService'

const prisma = new PrismaClient()

async function main() {
  // test01 사용자 찾기
  const user = await prisma.user.findUnique({
    where: { username: 'test01' },
    select: { id: true, experience: true, level: true }
  })
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  console.log('Before test:', user)
  
  // 게시글 찾기 (가장 최근 게시글)
  const post = await prisma.post.findFirst({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, userId: true }
  })
  
  if (!post) {
    console.error('No posts found')
    return
  }
  
  console.log('Testing on post:', post.title)
  
  // 첫 번째 댓글 - 경험치 받아야 함
  console.log('\n1. First comment on post:')
  const hasExp1 = await ExperienceService.hasReceivedCommentExperience(user.id, post.id)
  console.log('Has received exp before:', hasExp1)
  
  if (!hasExp1 && post.userId !== user.id) {
    const result1 = await ExperienceService.awardExperience(user.id, 'COMMENT_CREATE', {
      postId: post.id
    })
    console.log('Experience awarded:', result1.experienceGained)
  } else {
    console.log('No experience awarded (already received or own post)')
  }
  
  // 두 번째 댓글 - 경험치 안 받아야 함
  console.log('\n2. Second comment on same post:')
  const hasExp2 = await ExperienceService.hasReceivedCommentExperience(user.id, post.id)
  console.log('Has received exp before:', hasExp2)
  
  if (!hasExp2 && post.userId !== user.id) {
    console.log('ERROR: Should not award experience!')
  } else {
    console.log('Correct: No experience awarded')
  }
  
  // 최종 경험치 확인
  const afterUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { experience: true, level: true }
  })
  
  console.log('\nAfter test:', afterUser)
  
  // 경험치 로그 확인
  const logs = await prisma.userExperienceLog.findMany({
    where: {
      userId: user.id,
      actionType: 'COMMENT_CREATE'
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  console.log('\nComment experience logs:')
  logs.forEach(log => {
    console.log(`- ${log.createdAt}: +${log.experienceGained} XP (postId: ${log.metadata})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())