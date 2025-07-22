# CLAUDE.md

Instructions for Claude AI when working with this codebase.

## Project Summary

Sports Live - Real-time sports broadcasting PWA with AI-powered automated match analysis via scheduled batch processing.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes  
- **Realtime**: Socket.io (Node.js)
- **AI**: Python, LangChain (batch jobs)
- **DB**: PostgreSQL, Redis

## Architecture

```
Next.js (Frontend + API) → PostgreSQL/Redis
    ↓                           ↑
Socket.io (Realtime)      Python AI (Batch)
```

## Key Patterns

### API Response Format
```typescript
{
  success: boolean;
  data?: any;
  error?: { code: string; message: string };
  meta?: { page: number; total: number };
}
```

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  return NextResponse.json({
    success: false,
    error: { 
      code: 'ERROR_CODE',
      message: 'User-friendly message'
    }
  }, { status: 400 });
}
```

### Database Access
```typescript
// Use Prisma or Drizzle ORM
const user = await prisma.user.create({
  data: { ... }
});
```

## Common Tasks

### Create API Endpoint
```typescript
// app/api/[resource]/route.ts
export async function GET(request: Request) {
  // Validate auth
  // Query database  
  // Return response
}
```

### Add Realtime Feature
```typescript
// Socket.io event handlers
io.on('connection', (socket) => {
  socket.on('event_name', async (data) => {
    // Validate
    // Process
    // Emit response
  });
});
```

### Create AI Batch Script
```python
# ai-worker/scripts/analysis.py
async def analyze_match(match_id: int):
    # 1. Fetch data
    # 2. Run LangChain agents
    # 3. Save to database
    # 4. Notify via API
```

## Development Commands

```bash
# Start everything
docker-compose up -d
npm run dev

# Database
npx prisma migrate dev
npx prisma studio

# AI scripts
python -m scripts.analyze --match-id 123
```

## Code Style

- TypeScript strict mode
- Functional components
- Async/await over promises
- Descriptive variable names
- Comment complex logic

## Current Focus

Working on Phase 1: Foundation (auth, boards, basic features)

## Important: API Development Guidelines

When developing API endpoints, **MUST** follow the patterns in `/docs/api-development-guide.md`:
- Service Layer Pattern (business logic separation)
- Repository Pattern (data access abstraction)  
- DTO Pattern (data validation and transformation)
- Standardized error handling
- Consistent API responses

**Never** put business logic directly in API routes! API routes should only:
1. Parse request data
2. Call service methods
3. Return standardized responses

Example:
```typescript
// ✅ GOOD - API route as thin controller
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await postService.create(data, request)
    return ApiResponse.success(result)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// ❌ BAD - Business logic in API route
export async function POST(request: Request) {
  const data = await request.json()
  if (!data.title) { ... }  // Don't do validation here
  const post = await prisma.post.create({ ... })  // Don't access DB directly
  return NextResponse.json(post)
}
```