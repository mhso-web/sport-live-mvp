# Sports Live - AI-Powered Sports Broadcasting Platform

## 🎯 Project Overview

Sports Live is a real-time sports broadcasting platform with AI-powered automated match analysis. Built as a Progressive Web App (PWA) optimized for SEO, targeting the "sports live streaming" search keywords.

## 🏗 Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Next.js Frontend  │────▶│  Next.js API Routes │
│     (React PWA)     │     │   (Web Backend)     │
└─────────────────────┘     └─────────────────────┘
         │                            │
         │                            ├──────────────┐
         ▼                            ▼              ▼
┌─────────────────────┐     ┌─────────────┐  ┌─────────────┐
│    Socket.io        │     │ PostgreSQL  │  │    Redis    │
│  (Realtime Server)  │     │   (Main DB) │  │   (Cache)   │
└─────────────────────┘     └─────────────┘  └─────────────┘
                                     ↑
                            ┌─────────────────────┐
                            │  Python AI Worker   │
                            │ (Scheduled Batch)   │
                            └─────────────────────┘
```

## 🛠 Technology Stack

### Core Services
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend API**: Next.js API Routes
- **Realtime**: Socket.io (Node.js)
- **AI Worker**: Python 3.11, LangChain

### Infrastructure
- **Database**: PostgreSQL 15, Redis 7
- **Vector Store**: Pinecone
- **Deployment**: Vercel (Next.js), AWS EC2 (Socket.io), AWS Lambda (AI)
- **CDN**: CloudFlare

## 📁 Project Structure

```
sports-live/
├── apps/
│   ├── web/                 # Next.js application
│   │   ├── app/            # App router pages
│   │   ├── app/api/        # API routes (backend)
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities
│   │   └── public/         # Static assets
│   │
│   ├── realtime/           # Socket.io server
│   │   ├── src/           # Server code
│   │   └── package.json   
│   │
│   └── ai-worker/          # Python AI scripts
│       ├── agents/         # LangChain agents
│       ├── scripts/        # Batch scripts
│       └── requirements.txt
│
├── packages/               # Shared packages (optional)
│   ├── database/          # Prisma/Drizzle schemas
│   └── shared/            # Shared types/utils
│
├── docker-compose.yml     # Local development
├── turbo.json            # Monorepo config (optional)
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15
- Redis 7
- Docker & Docker Compose

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/sports-live.git
cd sports-live

# Install dependencies
npm install            # Install root dependencies
cd apps/web && npm install
cd ../realtime && npm install
cd ../ai-worker && pip install -r requirements.txt

# Setup environment variables
cp .env.example .env   # Edit with your values

# Start services
docker-compose up -d   # PostgreSQL, Redis

# Run development servers
npm run dev            # Runs all services (if using Turborepo)
# OR run individually:
cd apps/web && npm run dev      # http://localhost:3000
cd apps/realtime && npm run dev # ws://localhost:3001
```

## 🔑 Key Features

### 1. User System
- JWT-based authentication
- Experience points & level system
- Role management (user/analyst/admin)
- Badge rewards

### 2. Content Management
- Community board
- AI analysis board (auto-generated)
- Notice board (admin only)
- Event board

### 3. Real-time Features
- Match-specific chat rooms (1,000 users/room)
- Live score updates
- Real-time notifications
- 24-hour chat message TTL

### 4. AI Analysis (Batch Processing)
- Pre-match analysis (30 min before)
- Post-match comprehensive review
- Daily match previews (9 AM)
- Web scraping for data collection

### 5. PWA Features
- Offline support
- Home screen installation
- Push notifications (Android)
- Service worker caching

## 🔌 API Overview

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
```

### Posts
```
GET    /api/posts?board={type}&page={n}
POST   /api/posts
GET    /api/posts/:id
PUT    /api/posts/:id
DELETE /api/posts/:id
```

### Comments
```
GET    /api/posts/:id/comments
POST   /api/posts/:id/comments
DELETE /api/comments/:id
```

### Matches
```
GET    /api/matches?date={date}&sport={type}
GET    /api/matches/:id
GET    /api/matches/:id/analysis
```

### WebSocket Events
```javascript
// Connection
socket.connect('ws://localhost:3001')

// Chat
socket.emit('join_match_room', { matchId })
socket.emit('send_message', { message })
socket.on('new_message', callback)

// Live updates
socket.on('score_update', callback)
socket.on('match_event', callback)
```

## 🤖 AI Batch Processing

### Scheduled Jobs
```python
# Daily previews - 9:00 AM
python -m scripts.daily_analysis

# Pre-match analysis - 30 min before
python -m scripts.prematch_analysis --match-id {id}

# Post-match review - After match ends
python -m scripts.postmatch_review --match-id {id}
```

### Manual Execution
```bash
cd apps/ai-worker
python analyze.py --match-id 123 --type preview
```

## 🗄 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `posts` - All board posts
- `comments` - Post comments
- `matches` - Match information
- `match_analysis` - AI-generated analysis
- `user_badges` - Achievement system

### Redis Keys
```
chat:match:{id}:messages    # Chat messages (TTL: 24h)
cache:api:{endpoint}        # API response cache
session:{token}             # User sessions
rate_limit:{user}:{action}  # Rate limiting
```

## 🚀 Deployment

### Frontend + API (Vercel)
```bash
# Automatic deployment
git push origin main

# Environment variables set in Vercel dashboard
```

### Realtime Server (AWS EC2)
```bash
# PM2 setup
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### AI Worker (AWS Lambda)
```bash
# Deploy with Serverless Framework
cd apps/ai-worker
serverless deploy
```

## 📊 Performance Targets

- **Lighthouse Score**: 90+ (all categories)
- **API Response**: < 200ms (p95)
- **Chat Latency**: < 100ms
- **Concurrent Users**: 10,000+
- **Chat Room Capacity**: 1,000 users/room

## 🔒 Security

- HTTPS everywhere
- JWT with refresh tokens
- Rate limiting on all endpoints
- Input validation & sanitization
- SQL injection prevention
- XSS protection

## 📈 Monitoring

- **Infrastructure**: AWS CloudWatch
- **Errors**: Sentry
- **Analytics**: Google Analytics 4
- **Uptime**: UptimeRobot
- **Performance**: Core Web Vitals

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Load testing
npm run test:load
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/sports_live
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001

# apps/realtime/.env
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:3000

# apps/ai-worker/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/sports_live
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PINECONE_API_KEY=...
```

## 📄 License

MIT License - see LICENSE file for details