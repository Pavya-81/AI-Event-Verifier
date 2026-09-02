# Development Setup Guide

This guide provides step-by-step instructions for setting up the AI Quality Verification Scanner project for local development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Global Requirements
- **Git**: [Download](https://git-scm.com/download)
- **VS Code or IDE**: [VS Code](https://code.visualstudio.com/)

### Backend Requirements
- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v9+ (comes with Node.js)
- **PostgreSQL**: v12+ ([Download](https://www.postgresql.org/download/))

### Frontend Requirements
- Node.js v18+ (same as backend)
- npm v9+

### Mobile Requirements
- **Flutter**: v3+ ([Download](https://flutter.dev/docs/get-started/install))
- **Dart**: Included with Flutter
- **Android Studio** (for Android development) or **Xcode** (for iOS development)

## Project Structure

```
AI_Quality_Verification/
├── backend/               # Node.js/Express API
├── frontend/              # Next.js web application
├── mobile/                # Flutter mobile app
├── docs/                  # Documentation
└── README.md              # Project overview
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_event_scanner;

# Create user (optional, but recommended)
CREATE USER ai_scanner WITH PASSWORD 'your_secure_password';
ALTER ROLE ai_scanner WITH CREATEDB;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_event_scanner TO ai_scanner;

# Exit psql
\q
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Backend
NODE_ENV=development
BACKEND_PORT=3001
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://ai_scanner:your_secure_password@localhost:5432/ai_event_scanner"
DB_HOST=localhost
DB_PORT=5432
DB_USER=ai_scanner
DB_PASSWORD=your_secure_password
DB_NAME=ai_event_scanner

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp

# Email (optional, for future phases)
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (roles, categories, test users)
npm run db:seed
```

### 4. Start Backend Development Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 3001
📝 Environment: development
🔗 API URL: http://localhost:3001/api
💾 Database: ai_event_scanner
```

### Backend Useful Commands

```bash
npm run build              # Build for production
npm run test               # Run tests
npm run test:watch        # Watch mode tests
npm run test:coverage     # Run tests with coverage report
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run format            # Format code with Prettier
npm run db:studio         # Open Prisma Studio (GUI for database)
npm run db:reset          # Reset database (development only!)
```

### Access Backend

- **API Base URL**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=AI Event Scanner
NEXT_PUBLIC_APP_DESCRIPTION=Event Quality & Verification Scanner

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local
```

### Frontend Useful Commands

```bash
npm run build          # Build for production
npm run start          # Start production server
npm run type-check     # Type check without emitting
npm run lint           # Run ESLint
npm run format         # Format code
npm test               # Run tests
npm run test:coverage  # Coverage report
```

### Access Frontend

- **Web App**: `http://localhost:3000`

---

## Mobile Setup

### 1. Install Flutter

```bash
# Check Flutter version
flutter --version

# Update Flutter
flutter upgrade
```

### 2. Project Setup

```bash
cd mobile
flutter pub get
```

### 3. Generate Code

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 4. Configure API Endpoint

Update `lib/constants/api_constants.dart`:

```dart
const String apiBaseUrl = 'http://localhost:3001/api';
```

### 5. Run Mobile App

#### Android
```bash
flutter run -d android
```

#### iOS
```bash
flutter run -d ios
```

#### Specific Device
```bash
flutter devices                    # List available devices
flutter run -d <device_id>        # Run on specific device
```

### Mobile Useful Commands

```bash
flutter pub get                   # Get dependencies
flutter pub upgrade               # Upgrade dependencies
flutter pub run build_runner build  # Generate code
flutter analyze                   # Run analyzer
flutter test                      # Run unit tests
flutter clean                     # Clean build files
dart fix --apply                  # Auto-fix lints
```

---

## Docker Setup (Optional)

### Using Docker Compose for Database

Create `.env.docker`:

```env
POSTGRES_USER=ai_scanner
POSTGRES_PASSWORD=your_password
POSTGRES_DB=ai_event_scanner
```

Run Docker Compose:

```bash
docker-compose up -d postgres
```

The database will be available at `localhost:5432`.

### Build Backend Docker Image

```bash
cd backend
docker build -t ai-event-scanner-backend:latest .
docker run -p 3001:3001 --env-file ../.env ai-event-scanner-backend:latest
```

---

## Testing

### Backend Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Coverage threshold: **70%** across all metrics (lines, branches, functions, statements)

### Frontend Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### Mobile Tests

```bash
flutter test
```

---

## Database Inspection

### Using Prisma Studio

```bash
cd backend
npm run db:studio
```

Opens GUI at `http://localhost:5555`

### Using SQL Client

Connect to PostgreSQL:
- **Host**: localhost
- **Port**: 5432
- **Database**: ai_event_scanner
- **User**: ai_scanner
- **Password**: (from .env)

Popular clients: DBeaver, pgAdmin, DataGrip

---

## Development Workflow

### 1. Daily Start

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Mobile (optional)
cd mobile
flutter run -d android
```

### 2. Code Quality

Before committing:

```bash
# Backend
cd backend
npm run lint:fix
npm run format
npm run type-check

# Frontend
cd frontend
npm run lint
npm run format
npm run type-check
```

### 3. Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm test

# Mobile
cd mobile
flutter test
```

### 4. Database Changes

When modifying `prisma/schema.prisma`:

```bash
cd backend

# Create migration
npm run db:migrate

# Or push directly (development only)
npm run db:push

# Reset database if needed
npm run db:reset
npm run db:seed
```

---

## Troubleshooting

### Backend Issues

**Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running, check DATABASE_URL in .env

**Port Already in Use**
```
Error: listen EADDRINUSE :::3001
```
Solution: Change BACKEND_PORT in .env or kill process on port 3001

**Migrations Failed**
```
npm run db:reset
npm run db:seed
```

### Frontend Issues

**API Connection Error**
Ensure backend is running on port 3001 and NEXT_PUBLIC_API_URL is correct

**Port 3000 Already in Use**
```bash
# Linux/Mac
lsof -i :3000 | kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Mobile Issues

**Flutter pub get fails**
```bash
flutter pub get --no-offline
flutter pub upgrade
```

**Android build fails**
```bash
flutter clean
flutter pub get
flutter run
```

**iOS build fails**
```bash
cd ios
pod repo update
cd ..
flutter clean
flutter pub get
flutter run -d ios
```

---

## Environment Variables

### Backend (.env)
- `NODE_ENV`: Set to `development` for development
- `BACKEND_PORT`: Port number (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: App display name

### Mobile (lib/constants/api_constants.dart)
- `apiBaseUrl`: Backend API endpoint

---

## Performance Tips

1. **Backend**: Use `npm run dev` with tsx for hot reload
2. **Frontend**: Next.js automatically hot-reloads on file changes
3. **Mobile**: Flutter hot reload is automatic on file save
4. **Database**: Use Prisma Studio for quick data inspection
5. **Logging**: Adjust LOG_LEVEL in .env for development vs. production

---

## Next Steps

1. ✅ Complete this setup guide
2. 📖 Read [REQUIREMENTS_ANALYSIS.md](../docs/REQUIREMENTS_ANALYSIS.md)
3. 🏗️ Review [DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md)
4. 📋 Check [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md)
5. 🚀 Begin implementing features from [IMPLEMENTATION_PLAN.md](../docs/IMPLEMENTATION_PLAN.md)

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Flutter Documentation](https://flutter.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review official documentation links above
3. Check project documentation in `docs/` folder
4. Review error messages and logs carefully

---

**Happy coding! 🚀**
