import { PrismaClient } from '@prisma/client'
import { ExperienceService } from '../lib/services/experienceService'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ 
    where: { username: 'test01' },
    select: { id: true, experience: true, level: true }
  })
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  console.log('Before:', user)
  
  // 1 XP만 더 주면 레벨 2
  const result = await ExperienceService.awardExperience(user.id, 'POST_LIKE', {
    test: true
  })
  console.log('Result:', result)
  
  const after = await prisma.user.findUnique({
    where: { username: 'test01' },
    select: { experience: true, level: true }
  })
  
  console.log('After:', after)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())