// API test script - run with: npx tsx scripts/test-api.ts

async function testAPI() {
  const baseURL = 'http://localhost:3000/api'

  console.log('Testing Board APIs...\n')

  // Test 1: Get all boards
  try {
    const res = await fetch(`${baseURL}/boards`)
    const data = await res.json()
    console.log('✓ GET /api/boards:', data.success ? 'Success' : 'Failed')
    console.log('  Board count:', data.data?.length || 0)
  } catch (error) {
    console.log('✗ GET /api/boards: Error -', error)
  }

  // Test 2: Get community boards
  try {
    const res = await fetch(`${baseURL}/boards?type=COMMUNITY`)
    const data = await res.json()
    console.log('✓ GET /api/boards?type=COMMUNITY:', data.success ? 'Success' : 'Failed')
    console.log('  Community boards:', data.data?.map((b: any) => b.name).join(', ') || 'None')
  } catch (error) {
    console.log('✗ GET /api/boards?type=COMMUNITY: Error -', error)
  }

  // Test 3: Get specific board by slug
  try {
    const res = await fetch(`${baseURL}/boards/general`)
    const data = await res.json()
    console.log('✓ GET /api/boards/general:', data.success ? 'Success' : 'Failed')
    console.log('  Board name:', data.data?.name || 'Not found')
  } catch (error) {
    console.log('✗ GET /api/boards/general: Error -', error)
  }

  console.log('\nTesting Post APIs...\n')

  // Test 4: Get all posts
  try {
    const res = await fetch(`${baseURL}/posts`)
    const data = await res.json()
    console.log('✓ GET /api/posts:', data.success ? 'Success' : 'Failed')
    console.log('  Post count:', data.data?.length || 0)
  } catch (error) {
    console.log('✗ GET /api/posts: Error -', error)
  }

  // Test 5: Get posts with filters
  try {
    const res = await fetch(`${baseURL}/posts?boardType=COMMUNITY&limit=5`)
    const data = await res.json()
    console.log('✓ GET /api/posts?boardType=COMMUNITY:', data.success ? 'Success' : 'Failed')
    console.log('  Filtered posts:', data.data?.length || 0)
  } catch (error) {
    console.log('✗ GET /api/posts?boardType=COMMUNITY: Error -', error)
  }

  console.log('\nNote: POST/PUT/DELETE endpoints require authentication')
}

testAPI()