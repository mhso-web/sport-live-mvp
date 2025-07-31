import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

// Vercel PostgreSQL 연결을 위한 DATABASE_URL 사용
const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('Vercel PostgreSQL에 데이터 가져오기 시작...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

    // exported-data.json 파일 읽기
    const jsonData = await fs.readFile('exported-data.json', 'utf-8')
    const data = JSON.parse(jsonData)

    // 1. 사용자 데이터 삽입
    console.log(`\n사용자 ${data.users.length}명 삽입 중...`)
    for (const user of data.users) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            experience: user.experience,
            level: user.level,
            bio: user.bio,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        })
        console.log(`  ✅ ${user.username} (${user.role})`)
      } catch (error) {
        console.error(`  ❌ ${user.username} 삽입 실패:`, error)
      }
    }
    console.log('✅ 사용자 데이터 삽입 완료')

    // 2. 파트너 데이터 삽입
    if (data.partners && data.partners.length > 0) {
      console.log(`\n파트너 ${data.partners.length}개 삽입 중...`)
      for (const partner of data.partners) {
        try {
          await prisma.partner.upsert({
            where: { id: partner.id },
            update: {},
            create: {
              id: partner.id,
              name: partner.name,
              description: partner.description,
              detailContent: partner.detailContent,
              websiteUrl: partner.websiteUrl,
              bannerImage: partner.bannerImage,
              isActive: partner.isActive,
              viewCount: partner.viewCount,
              createdBy: partner.createdBy,
              createdAt: new Date(partner.createdAt),
              updatedAt: new Date(partner.updatedAt)
            }
          })
          console.log(`  ✅ ${partner.name}`)
        } catch (error) {
          console.error(`  ❌ ${partner.name} 삽입 실패:`, error)
        }
      }
      console.log('✅ 파트너 데이터 삽입 완료')
    }

    // 3. 게시물 데이터 삽입
    if (data.posts && data.posts.length > 0) {
      console.log(`\n게시물 ${data.posts.length}개 삽입 중...`)
      for (const post of data.posts) {
        try {
          await prisma.post.create({
            data: {
              ...post,
              createdAt: new Date(post.createdAt),
              updatedAt: new Date(post.updatedAt)
            }
          })
        } catch (error) {
          console.error(`  ❌ 게시물 삽입 실패:`, error)
        }
      }
      console.log('✅ 게시물 데이터 삽입 완료')
    }

    // 4. 댓글 데이터 삽입
    if (data.comments && data.comments.length > 0) {
      console.log(`\n댓글 ${data.comments.length}개 삽입 중...`)
      for (const comment of data.comments) {
        try {
          await prisma.comment.create({
            data: {
              ...comment,
              createdAt: new Date(comment.createdAt),
              updatedAt: new Date(comment.updatedAt)
            }
          })
        } catch (error) {
          console.error(`  ❌ 댓글 삽입 실패:`, error)
        }
      }
      console.log('✅ 댓글 데이터 삽입 완료')
    }

    console.log('\n✅ 모든 데이터 가져오기 완료!')

    // 삽입된 데이터 확인
    const userCount = await prisma.user.count()
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { username: true, email: true }
    })

    console.log(`\n현재 데이터베이스 상태:`)
    console.log(`- 총 사용자 수: ${userCount}`)
    console.log(`- 관리자 계정: ${adminUser?.username} (${adminUser?.email})`)

  } catch (error) {
    console.error('데이터 가져오기 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 명령줄 인자로 확인
if (process.argv[2] === '--confirm') {
  importData()
} else {
  console.log('⚠️  주의: 이 스크립트는 Vercel PostgreSQL에 데이터를 삽입합니다.')
  console.log('실행하려면 다음 명령어를 사용하세요:')
  console.log('npx tsx scripts/import-data-vercel.ts --confirm')
}