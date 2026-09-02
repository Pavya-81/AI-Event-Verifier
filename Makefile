.PHONY: help install dev build test lint format clean db-setup db-seed db-reset docker-up docker-down

help:
	@echo "======================================"
	@echo "AI Quality Verification Scanner"
	@echo "======================================"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install          Install all dependencies (backend, frontend)"
	@echo "  make setup            Complete setup (install + db-setup + db-seed)"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start all services (backend, frontend)"
	@echo "  make dev-backend      Start only backend"
	@echo "  make dev-frontend     Start only frontend"
	@echo ""
	@echo "Building:"
	@echo "  make build            Build all projects"
	@echo "  make build-backend    Build backend"
	@echo "  make build-frontend   Build frontend"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make test-coverage    Run tests with coverage"
	@echo "  make lint             Run linters"
	@echo "  make lint-fix         Fix linting issues"
	@echo "  make format           Format code"
	@echo ""
	@echo "Database:"
	@echo "  make db-setup         Create and setup database"
	@echo "  make db-seed          Seed initial data"
	@echo "  make db-reset         Reset database (development only!)"
	@echo "  make db-migrate       Run database migrations"
	@echo "  make db-studio        Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up        Start Docker containers"
	@echo "  make docker-down      Stop Docker containers"
	@echo "  make docker-reset     Reset Docker containers"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            Clean all build outputs"
	@echo "  make logs             Show backend logs"
	@echo ""

# ============================================================
# INSTALLATION
# ============================================================

install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm install && cd ..
	@cd frontend && npm install && cd ..
	@echo "✅ Dependencies installed"

setup: install db-setup db-seed
	@echo "🎉 Setup complete!"

# ============================================================
# DEVELOPMENT
# ============================================================

dev:
	@echo "🚀 Starting all services..."
	@echo "Backend: http://localhost:3001/api"
	@echo "Frontend: http://localhost:3000"
	@echo ""
	@echo "Press Ctrl+C to stop"
	@cd backend && npm run dev & cd frontend && npm run dev

dev-backend:
	@cd backend && npm run dev

dev-frontend:
	@cd frontend && npm run dev

# ============================================================
# BUILDING
# ============================================================

build: build-backend build-frontend
	@echo "✅ All builds complete"

build-backend:
	@echo "🔨 Building backend..."
	@cd backend && npm run build
	@echo "✅ Backend build complete"

build-frontend:
	@echo "🔨 Building frontend..."
	@cd frontend && npm run build
	@echo "✅ Frontend build complete"

# ============================================================
# TESTING
# ============================================================

test: test-backend test-frontend
	@echo "✅ All tests passed"

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && npm run test

test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

test-coverage:
	@echo "📊 Running tests with coverage..."
	@cd backend && npm run test:coverage
	@cd frontend && npm run test:coverage

# ============================================================
# LINTING & FORMATTING
# ============================================================

lint:
	@echo "📋 Running linters..."
	@cd backend && npm run lint
	@cd frontend && npm run lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	@cd backend && npm run lint:fix
	@cd frontend && npm run lint

format:
	@echo "✨ Formatting code..."
	@cd backend && npm run format
	@cd frontend && npm run format

# ============================================================
# DATABASE
# ============================================================

db-setup:
	@echo "🗄️  Setting up database..."
	@cd backend && npm run db:generate
	@cd backend && npm run db:migrate
	@echo "✅ Database setup complete"

db-seed:
	@echo "🌱 Seeding database..."
	@cd backend && npm run db:seed
	@echo "✅ Database seeded"

db-reset:
	@echo "⚠️  Resetting database..."
	@cd backend && npm run db:reset
	@echo "✅ Database reset complete"

db-migrate:
	@echo "📝 Running migrations..."
	@cd backend && npm run db:migrate

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	@cd backend && npm run db:studio

# ============================================================
# DOCKER
# ============================================================

docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Docker containers started"
	@echo "PostgreSQL: localhost:5432"
	@echo "pgAdmin: http://localhost:5050 (if enabled)"

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down
	@echo "✅ Docker containers stopped"

docker-reset:
	@echo "🔄 Resetting Docker containers..."
	docker-compose down -v
	docker-compose up -d
	@echo "✅ Docker containers reset"

docker-logs:
	docker-compose logs -f

# ============================================================
# UTILITIES
# ============================================================

clean:
	@echo "🧹 Cleaning build outputs..."
	@rm -rf backend/dist
	@rm -rf backend/node_modules/.cache
	@rm -rf frontend/.next
	@rm -rf frontend/out
	@echo "✅ Cleanup complete"

logs:
	@echo "📚 Backend logs:"
	@tail -f backend/logs/combined.log 2>/dev/null || echo "No logs yet"

type-check:
	@echo "🔍 Type checking..."
	@cd backend && npm run type-check
	@cd frontend && npm run type-check
	@echo "✅ Type checking complete"

# ============================================================
# QUICK COMMANDS
# ============================================================

start: dev
stop: docker-down
reset: docker-reset db-reset
fresh: clean install setup dev
