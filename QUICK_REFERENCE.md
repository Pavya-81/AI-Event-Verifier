# Quick Reference Card

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup database (on local PostgreSQL)
cd ../backend
cp ../.env.example ../.env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate
npm run db:seed

# 3. Start services
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Database: localhost:5432

---

## 📋 Test Credentials

```
Email: student@example.com
       organizer@example.com
       admin@example.com
Password: Test123!@#
```

---

## 🎯 Essential Commands

### Using Makefile (Recommended)
```bash
make help               # Show all commands
make setup              # Complete setup
make dev                # Start all services
make test               # Run all tests
make lint               # Run linters
make db-seed            # Seed database
make docker-up          # Start Docker
```

### Backend
```bash
npm run dev             # Development server
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Check code
npm run format          # Format code
npm run db:migrate      # Database migration
npm run db:seed         # Seed data
npm run db:studio       # Open database GUI
```

### Frontend
```bash
npm run dev             # Development server
npm run build           # Production build
npm test                # Run tests
npm run lint            # Check code
npm run format          # Format code
npm run type-check      # Type checking
```

### Mobile (Flutter)
```bash
flutter pub get         # Get dependencies
flutter run             # Run app
flutter test            # Run tests
flutter analyze         # Check code
dart fix --apply        # Auto-fix lints
```

---

## 🗄️ Database Quick Guide

### Start PostgreSQL

**With Docker:**
```bash
docker-compose up -d postgres
```

**Local installation:**
```bash
# macOS (Homebrew)
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows
# Use PostgreSQL installer or pgAdmin
```

### Database Connection

```
Host: localhost
Port: 5432
User: ai_scanner (or your user)
Password: (from .env)
Database: ai_event_scanner
```

### Useful Commands

```bash
npm run db:seed         # Add test data
npm run db:studio       # Open Prisma Studio (GUI)
npm run db:reset        # Reset database (dev only!)
npm run db:migrate      # Apply migrations
```

### Using pgAdmin (Docker)

```bash
docker-compose --profile with-gui up -d
# Access: http://localhost:5050
# Email: admin@example.com
# Password: admin
```

---

## 📦 Project Structure

```
.
├── backend/             # Express + TypeScript API
├── frontend/            # Next.js 14 + React web app
├── mobile/              # Flutter mobile app
├── docs/                # Documentation
│   ├── development.md   # Setup guide
│   └── REQUIREMENTS_ANALYSIS.md
├── docker-compose.yml   # Docker services
├── .env.example         # Environment template
├── Makefile             # Development commands
└── README.md            # Project overview
```

---

## 🔧 Configuration Files

### Environment (.env)
```env
# Backend
NODE_ENV=development
BACKEND_PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_event_scanner
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## ✅ Pre-Configured

- ✅ TypeScript strict mode (all 3 platforms)
- ✅ ESLint + Prettier (consistent code style)
- ✅ Jest testing with 70% coverage threshold
- ✅ PostgreSQL with Prisma ORM
- ✅ 13-table database schema with seed data
- ✅ Docker Compose for local development
- ✅ Security: bcrypt, JWT, CORS, Helmet
- ✅ Logging: Winston (backend), Console (frontend/mobile)
- ✅ File upload with Multer

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
Change port in .env or kill process:
```bash
# Linux/Mac
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
psql -U ai_scanner -d ai_event_scanner

# If not exists, create:
createdb ai_event_scanner
```

### "Migration failed"
```bash
npm run db:reset
npm run db:seed
```

### "Next.js won't start"
```bash
rm -rf .next
npm run dev
```

---

## 📚 API Endpoints (When Implemented)

```
POST   /api/v1/auth/register      # Register new user
POST   /api/v1/auth/login         # Login
POST   /api/v1/auth/refresh       # Refresh token

GET    /api/v1/events             # List events
POST   /api/v1/events             # Create event
GET    /api/v1/events/:id         # Get event details
PUT    /api/v1/events/:id         # Update event
DELETE /api/v1/events/:id         # Delete event

GET    /api/v1/users/profile      # Get user profile
PUT    /api/v1/users/profile      # Update profile

GET    /api/v1/health             # Health check
```

---

## 🎓 Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Docs](https://react.dev)
- [Flutter Docs](https://flutter.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📞 Quick Help

For detailed setup: See [docs/development.md](./docs/development.md)
For requirements: See [docs/REQUIREMENTS_ANALYSIS.md](./docs/REQUIREMENTS_ANALYSIS.md)
For database: See [docs/DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md)
For implementation: See [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)

---

## ✨ Next Steps

1. ✅ Complete local setup from [docs/development.md](./docs/development.md)
2. ✅ Verify all services running:
   - Backend: http://localhost:3001/api/health
   - Frontend: http://localhost:3000
3. ✅ Run tests: `make test`
4. ✅ Begin implementing Stage 2 (Core API)

---

**Ready to code? Start with `make dev` or follow [docs/development.md](./docs/development.md)** 🚀
