import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 최근 경험치 로그 확인
  const logs = await prisma.userExperienceLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: true }
  })
  
  console.log('Recent experience logs:')
  logs.forEach(log => {
    console.log(`- ${log.user.username}: ${log.actionType} +${log.experienceGained} XP at ${log.createdAt}`)
  })
  
  // 사용자별 현재 레벨 확인
  const users = await prisma.user.findMany({
    where: { username: { in: ['test01', 'admin', 'sports_fan'] } },
    select: { username: true, level: true, experience: true }
  })
  
  console.log('\nUser levels:')
  users.forEach(u => console.log(`- ${u.username}: Lv.${u.level}, ${u.experience} XP`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())