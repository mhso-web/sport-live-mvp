import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 더미 사용자 데이터
const dummyUsers = [
  { username: '축구매니아', email: 'soccer1@test.com', level: 15, experience: 15000 },
  { username: '손흥민팬', email: 'soccer2@test.com', level: 23, experience: 23000 },
  { username: '메시최고', email: 'soccer3@test.com', level: 31, experience: 31000 },
  { username: '야구천재', email: 'baseball1@test.com', level: 12, experience: 12000 },
  { username: 'KBO러버', email: 'baseball2@test.com', level: 28, experience: 28000 },
  { username: '홈런왕', email: 'baseball3@test.com', level: 19, experience: 19000 },
  { username: 'LCK팬보이', email: 'esports1@test.com', level: 35, experience: 35000 },
  { username: '페이커형', email: 'esports2@test.com', level: 42, experience: 42000 },
  { username: '티원화이팅', email: 'esports3@test.com', level: 27, experience: 27000 },
  { username: '농구는인생', email: 'basketball1@test.com', level: 18, experience: 18000 },
  { username: 'NBA덕후', email: 'basketball2@test.com', level: 25, experience: 25000 },
  { username: '슬램덩크', email: 'basketball3@test.com', level: 33, experience: 33000 },
  { username: '스포츠만세', email: 'sports1@test.com', level: 21, experience: 21000 },
  { username: '운동선수', email: 'sports2@test.com', level: 16, experience: 16000 },
  { username: '체육인', email: 'sports3@test.com', level: 29, experience: 29000 },
  { username: '라이브중독', email: 'live1@test.com', level: 38, experience: 38000 },
  { username: '중계마스터', email: 'live2@test.com', level: 45, experience: 45000 },
  { username: '경기분석가', email: 'analysis1@test.com', level: 50, experience: 50000 },
  { username: '통계전문가', email: 'stats1@test.com', level: 41, experience: 41000 },
  { username: '베팅고수', email: 'betting1@test.com', level: 36, experience: 36000 },
]

// 게시판별 더미 게시글 데이터
const postTemplates = {
  general: [
    { title: '오늘 날씨 좋네요 운동하기 딱이에요', content: '다들 오늘 운동 계획 있으신가요? 저는 조깅 다녀왔는데 날씨가 정말 좋더라구요. 운동하기 딱 좋은 날씨입니다!' },
    { title: '스포츠 라이브 사이트 정말 좋네요', content: '다른 사이트들보다 훨씬 깔끔하고 사용하기 편해요. 특히 실시간 중계 기능이 정말 마음에 듭니다.' },
    { title: '처음 가입했습니다 잘 부탁드려요', content: '안녕하세요! 스포츠를 좋아해서 가입했습니다. 앞으로 자주 활동할게요. 잘 부탁드립니다!' },
    { title: '레벨 시스템이 재밌네요', content: '다른 커뮤니티와 달리 레벨 시스템이 있어서 재밌어요. 열심히 활동해서 레벨 올려야겠습니다 ㅎㅎ' },
    { title: '모바일에서도 잘 되나요?', content: '혹시 모바일 앱도 있나요? 웹에서는 잘 되는데 앱으로도 보고 싶네요.' },
  ],
  football: [
    { title: '손흥민 오늘 경기 어땠나요?', content: '못 봤는데 오늘 토트넘 경기에서 손흥민 활약 어땠나요? 골은 넣었나요?' },
    { title: 'EPL vs 라리가 어디가 더 재밌나요?', content: '개인적으로는 EPL이 더 박진감 넘치는 것 같은데 여러분들 생각은 어떠신가요?' },
    { title: '이번 시즌 챔스 우승 예상', content: '레알 마드리드가 또 우승할 것 같긴 한데... 맨시티도 강력하고 바르사도 만만치 않네요.' },
    { title: 'K리그도 봐주세요!', content: 'K리그 수준도 많이 올라왔어요. 울산이랑 전북 경기는 정말 재밌습니다!' },
    { title: '월드컵 예선 일정 나왔네요', content: '다음달에 중요한 경기들이 많네요. 한국 대표팀 화이팅!' },
  ],
  baseball: [
    { title: 'KBO 포스트시즌 예상해봅시다', content: 'LG가 1위 할 것 같은데 여러분들 생각은 어떠신가요? SSG도 무섭고...' },
    { title: '오타니 진짜 대단하네요', content: '투타 겸업하면서 저 성적이 가능한가요? 진짜 외계인 맞는 것 같아요.' },
    { title: '한화 이번엔 가을야구 가능할까요?', content: '매년 기대하는데... 이번엔 정말 갈 수 있을 것 같은 느낌이 듭니다!' },
    { title: 'MLB vs KBO 수준 차이', content: '확실히 MLB가 수준이 높긴 하지만 KBO도 나름 재미있어요. 각자의 매력이 있는 것 같습니다.' },
    { title: '야구장 직관 추천', content: '잠실야구장 분위기 정말 좋더라구요. 다들 어느 구장 좋아하시나요?' },
  ],
  esports: [
    { title: 'T1 월즈 우승 가능할까요?', content: '페이커 폼이 올라오고 있는데 이번엔 정말 우승할 수 있을 것 같아요!' },
    { title: 'LCK vs LPL 결승 예상', content: '매번 LPL이 이기긴 하는데... 이번엔 LCK가 이겼으면 좋겠네요.' },
    { title: '젠지 선수 이적 루머', content: '초크비 다른 팀 간다는 소문 들으셨나요? 사실인지 궁금하네요.' },
    { title: '롤 신챔프 너무 사기 아닌가요?', content: '밸런스 완전 붕괴된 것 같은데... 너프 언제 되나요?' },
    { title: '발로란트도 재밌더라구요', content: 'LoL만 하다가 발로란트 해봤는데 이것도 재밌네요. 같이 하실 분?' },
  ],
  basketball: [
    { title: 'NBA 시즌 시작했네요!', content: '드디어 NBA 새 시즌이 시작했습니다. 다들 어느 팀 응원하시나요?' },
    { title: 'KBL도 재밌어요', content: 'NBA만 보지 마시고 KBL도 봐주세요. SK vs KCC 라이벌전은 정말 재밌습니다!' },
    { title: '르브론 아직도 현역이라니', content: '나이가 몇인데 아직도 저 실력이 유지되나요? 진짜 대단합니다.' },
    { title: '슬램덩크 보고 농구 시작했어요', content: '어릴 때 슬램덩크 보고 농구 시작했는데 다들 비슷하신가요? ㅎㅎ' },
    { title: '3점슛이 안 들어가요 ㅠㅠ', content: '연습해도 3점슛 성공률이 안 올라가네요. 팁 좀 주세요!' },
  ],
}

async function createDummyUsers() {
  console.log('👥 Creating dummy users...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const createdUsers = []
  for (const userData of dummyUsers) {
    try {
      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash: hashedPassword,
          role: Role.USER,
        }
      })
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.username}`)
    } catch (error) {
      console.log(`⚠️  User ${userData.username} might already exist, skipping...`)
    }
  }
  
  return createdUsers
}

async function createDummyPosts(users: any[]) {
  console.log('\n📝 Creating dummy posts...')
  
  // Get all board categories
  const categories = await prisma.boardCategory.findMany()
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat]))
  
  // Create posts for each board
  for (const [boardSlug, posts] of Object.entries(postTemplates)) {
    const category = categoryMap.get(boardSlug)
    if (!category) {
      console.log(`⚠️  Category ${boardSlug} not found, skipping...`)
      continue
    }
    
    console.log(`\n📌 Creating posts for ${category.name}...`)
    
    // Create 20-30 posts for each board
    const postCount = Math.floor(Math.random() * 11) + 20 // 20-30 posts
    
    for (let i = 0; i < postCount; i++) {
      const postTemplate = posts[i % posts.length]
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)) // Random date within last 30 days
      
      try {
        const post = await prisma.post.create({
          data: {
            title: `${postTemplate.title} ${i > posts.length ? `(${Math.floor(i / posts.length) + 1})` : ''}`,
            content: postTemplate.content,
            summary: postTemplate.content.substring(0, 100),
            boardType: category.boardType,
            categoryId: category.id,
            userId: randomUser.id,
            views: Math.floor(Math.random() * 500),
            likesCount: Math.floor(Math.random() * 50),
            isPinned: i === 0 && Math.random() > 0.7, // 30% chance for first post to be pinned
            createdAt: randomDate,
            updatedAt: randomDate,
          }
        })
        
        // Add some likes randomly
        const likeCount = Math.floor(Math.random() * 5)
        for (let j = 0; j < likeCount; j++) {
          const likeUser = users[Math.floor(Math.random() * users.length)]
          try {
            await prisma.postLike.create({
              data: {
                postId: post.id,
                userId: likeUser.id,
              }
            })
          } catch (e) {
            // Ignore duplicate likes
          }
        }
        
        // Add some comments randomly (30% chance)
        if (Math.random() > 0.7) {
          const commentCount = Math.floor(Math.random() * 5) + 1
          for (let j = 0; j < commentCount; j++) {
            const commentUser = users[Math.floor(Math.random() * users.length)]
            await prisma.comment.create({
              data: {
                content: getRandomComment(boardSlug),
                postId: post.id,
                userId: commentUser.id,
              }
            })
          }
        }
        
        console.log(`✅ Created post: ${post.title}`)
      } catch (error) {
        console.error(`❌ Error creating post:`, error)
      }
    }
  }
}

function getRandomComment(boardSlug: string): string {
  const comments = {
    general: [
      '좋은 글이네요!',
      '공감합니다 ㅎㅎ',
      '저도 같은 생각이에요',
      '유용한 정보 감사합니다',
      '재밌게 읽었습니다',
    ],
    football: [
      '완전 공감해요!',
      '저도 그 경기 봤는데 대박이었죠',
      '다음 경기도 기대되네요',
      '좋은 분석입니다',
      '축구는 역시 재밌어요',
    ],
    baseball: [
      '야구 최고!',
      '이번 시즌 정말 재밌네요',
      '좋은 정보 감사합니다',
      '저도 직관 가고 싶어요',
      '우리 팀 화이팅!',
    ],
    esports: [
      'ㄹㅇ 인정합니다',
      'T1 화이팅!',
      '이번 패치 진짜 별로예요',
      '프로 경기는 다르네요',
      'LCK 최고!',
    ],
    basketball: [
      '농구는 정말 재밌죠',
      'NBA 수준이 다르긴 해요',
      '저도 농구 좋아해요',
      '좋은 경기였습니다',
      '다음 경기도 기대!',
    ],
  }
  
  const boardComments = comments[boardSlug as keyof typeof comments] || comments.general
  return boardComments[Math.floor(Math.random() * boardComments.length)]
}

async function main() {
  try {
    console.log('🚀 Starting dummy data generation...\n')
    
    // Create dummy users
    const users = await createDummyUsers()
    
    if (users.length === 0) {
      console.log('⚠️  No new users created. They might already exist.')
      // Get existing users for post creation
      const existingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: dummyUsers.map(u => u.email)
          }
        }
      })
      
      if (existingUsers.length > 0) {
        await createDummyPosts(existingUsers)
      } else {
        console.log('❌ No users found to create posts')
      }
    } else {
      // Create dummy posts
      await createDummyPosts(users)
    }
    
    console.log('\n✅ Dummy data generation completed!')
    
    // Print statistics
    const userCount = await prisma.user.count()
    const postCount = await prisma.post.count()
    const commentCount = await prisma.comment.count()
    
    console.log('\n📊 Database Statistics:')
    console.log(`- Total Users: ${userCount}`)
    console.log(`- Total Posts: ${postCount}`)
    console.log(`- Total Comments: ${commentCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()