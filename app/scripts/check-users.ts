import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { username: true, level: true, experience: true }
  })
  
  console.log('All users:')
  users.forEach(u => console.log(`- ${u.username}: Lv.${u.level}, ${u.experience} XP`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())