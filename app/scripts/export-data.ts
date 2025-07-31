import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function exportData() {
  try {
    console.log('데이터 내보내기 시작...')

    // 모든 사용자 데이터 가져오기
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        experience: true,
        level: true,
        bio: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 모든 파트너 데이터 가져오기
    const partners = await prisma.partner.findMany()

    // 모든 게시물 데이터 가져오기
    const posts = await prisma.post.findMany()

    // 모든 댓글 데이터 가져오기
    const comments = await prisma.comment.findMany()

    // 데이터를 JSON으로 저장
    const exportData = {
      users,
      partners,
      posts,
      comments,
      exportedAt: new Date().toISOString()
    }

    await fs.writeFile(
      'exported-data.json',
      JSON.stringify(exportData, null, 2)
    )

    console.log('데이터 내보내기 완료!')
    console.log(`- 사용자: ${users.length}명`)
    console.log(`- 파트너: ${partners.length}개`)
    console.log(`- 게시물: ${posts.length}개`)
    console.log(`- 댓글: ${comments.length}개`)

  } catch (error) {
    console.error('데이터 내보내기 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()