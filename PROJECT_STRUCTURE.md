# Project Structure: AI Event Quality & Verification Scanner - Phase 1

**Document Status**: Phase 1 Planning  
**Architecture**: Monolithic backend, Next.js frontend, Flutter mobile  
**Date**: 2026-09-01

---

## Executive Summary

This document specifies the complete directory structure for the Phase 1 application across three main components:

1. **Backend** (Node.js + Express/Fastify + PostgreSQL)
2. **Frontend** (Next.js + React + TypeScript)
3. **Mobile** (Flutter + Dart)

The structure emphasizes modularity, maintainability, and clean separation of concerns.

---

## 1. Root Project Structure

```
ai-event-scanner/
├── backend/                    # Node.js backend
├── frontend/                   # Next.js frontend
├── mobile/                     # Flutter mobile app
├── docs/                       # Shared documentation
├── data/                       # Data import/export
├── .gitignore                  # Version control ignore
├── .env.example                # Environment variables template
├── docker-compose.yml          # Docker setup for local development
├── README.md                   # Project overview
├── REQUIREMENTS_ANALYSIS.md    # Requirements (from Phase 1 planning)
├── DATABASE_DESIGN.md          # Database schema (from Phase 1 planning)
├── PROJECT_STRUCTURE.md        # This file
└── IMPLEMENTATION_PLAN.md      # Implementation stages
```

---

## 2. Backend Structure

### 2.1 Root Backend Directory

```
backend/
├── src/
│   ├── auth/                   # Authentication & authorization
│   ├── users/                  # User management
│   ├── organizers/             # Organizer profiles
│   ├── events/                 # Event management
│   ├── submissions/            # Event submission workflow
│   ├── categories/             # Event categories
│   ├── bookmarks/              # Event bookmarks
│   ├── registrations/          # Event registrations
│   ├── notifications/          # Notification system
│   ├── uploads/                # File upload handling
│   ├── admin/                  # Admin functionality
│   ├── analytics/              # Analytics & reporting
│   ├── audit/                  # Audit logging
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Shared utilities
│   ├── config/                 # Configuration
│   ├── database/               # Database setup & migrations
│   ├── types/                  # TypeScript types/interfaces
│   └── server.ts               # Express app setup & entry point
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── api/                    # API endpoint tests
│   └── fixtures/               # Test data fixtures
├── migrations/                 # Database migrations
├── seeds/                      # Database seed scripts
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── jest.config.js              # Jest config
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── README.md                   # Backend-specific setup
└── Dockerfile                  # Docker container config
```

### 2.2 Auth Module

```
backend/src/auth/
├── index.ts                    # Module entry point
├── auth.controller.ts          # HTTP request handlers
├── auth.service.ts             # Business logic
├── auth.middleware.ts          # Auth middleware (JWT/session)
├── auth.routes.ts              # Route definitions
├── validators/
│   ├── register.validator.ts   # Registration validation
│   ├── login.validator.ts      # Login validation
│   └── password.validator.ts   # Password strength validation
├── strategies/
│   ├── jwt.strategy.ts         # JWT strategy
│   └── local.strategy.ts       # Local (email/password) strategy
├── types.ts                    # Auth-specific types
└── __tests__/
    ├── auth.controller.test.ts
    ├── auth.service.test.ts
    └── auth.integration.test.ts
```

### 2.3 Events Module

```
backend/src/events/
├── index.ts                    # Module entry point
├── event.controller.ts         # HTTP handlers
├── event.service.ts            # Business logic
├── event.repository.ts         # Database queries
├── event.routes.ts             # Route definitions
├── event.types.ts              # Event types/interfaces
├── validators/
│   ├── create-event.validator.ts
│   ├── update-event.validator.ts
│   ├── search-events.validator.ts
│   └── filter-events.validator.ts
├── dto/                        # Data transfer objects
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── event-response.dto.ts
│   └── list-events.dto.ts
├── __tests__/
│   ├── event.controller.test.ts
│   ├── event.service.test.ts
│   ├── event.integration.test.ts
│   └── event.search.test.ts
└── constants.ts                # Event constants/enums
```

### 2.4 Submissions Module

```
backend/src/submissions/
├── index.ts
├── submission.controller.ts    # Admin review endpoints
├── submission.service.ts       # Submission workflow logic
├── submission.repository.ts    # Database queries
├── submission.routes.ts
├── submission.types.ts
├── validators/
│   ├── submit-event.validator.ts
│   ├── approve-event.validator.ts
│   ├── reject-event.validator.ts
│   └── request-changes.validator.ts
├── dto/
│   ├── submit-event.dto.ts
│   ├── approve-event.dto.ts
│   ├── reject-event.dto.ts
│   └── submission-response.dto.ts
├── __tests__/
│   ├── submission.controller.test.ts
│   ├── submission.service.test.ts
│   └── submission.workflow.test.ts
└── constants.ts                # Status enums, messages
```

### 2.5 Uploads Module

```
backend/src/uploads/
├── index.ts
├── upload.controller.ts        # File upload endpoints
├── upload.service.ts           # Upload logic
├── upload.routes.ts
├── upload.types.ts
├── validators/
│   ├── file-type.validator.ts  # MIME type validation
│   ├── file-size.validator.ts  # Size validation
│   └── file-scan.validator.ts  # Malware scan
├── strategies/
│   ├── disk-storage.ts         # Local disk storage
│   ├── s3-storage.ts           # AWS S3 storage (optional)
│   └── storage.interface.ts    # Storage interface
├── __tests__/
│   ├── upload.controller.test.ts
│   ├── upload.service.test.ts
│   └── upload.disk-storage.test.ts
└── constants.ts                # File constants
```

### 2.6 Admin Module

```
backend/src/admin/
├── index.ts
├── admin.controller.ts         # Admin endpoints
├── admin.service.ts            # Admin logic
├── admin.middleware.ts         # Admin authorization
├── admin.routes.ts
├── submissions/
│   ├── submissions.controller.ts
│   ├── submissions.service.ts
│   └── submissions.routes.ts
├── events/
│   ├── events.controller.ts
│   ├── events.service.ts
│   └── events.routes.ts
├── organizers/
│   ├── organizers.controller.ts
│   ├── organizers.service.ts
│   └── organizers.routes.ts
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.routes.ts
├── analytics/
│   ├── analytics.controller.ts
│   ├── analytics.service.ts
│   └── analytics.routes.ts
├── audit/
│   ├── audit.controller.ts
│   ├── audit.service.ts
│   └── audit.routes.ts
├── __tests__/
│   ├── admin.authorization.test.ts
│   └── admin.dashboard.test.ts
└── types.ts
```

### 2.7 Database Module

```
backend/src/database/
├── index.ts                    # Database connection setup
├── connection.ts               # PostgreSQL connection
├── migrations/
│   ├── 0001_init_users.sql
│   ├── 0002_init_roles.sql
│   ├── 0003_init_organizers.sql
│   ├── 0004_init_categories.sql
│   ├── 0005_init_events.sql
│   ├── 0006_init_event_versions.sql
│   ├── 0007_init_event_submissions.sql
│   ├── 0008_init_event_posters.sql
│   ├── 0009_init_event_bookmarks.sql
│   ├── 0010_init_event_registrations.sql
│   ├── 0011_init_notifications.sql
│   ├── 0012_init_audit_logs.sql
│   ├── 0013_create_indexes.sql
│   ├── 0014_seed_roles.sql
│   └── 0015_seed_categories.sql
├── seeds/
│   ├── seed.runner.ts          # Migration runner
│   ├── seed-roles.ts           # Seed roles
│   ├── seed-categories.ts      # Seed categories
│   └── seed-demo-data.ts       # Demo/test data
├── entities/                   # Prisma schema or TypeORM entities
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── organizer.entity.ts
│   ├── event.entity.ts
│   ├── submission.entity.ts
│   └── ... (all entities)
└── repositories/               # Data access layer
    ├── user.repository.ts
    ├── event.repository.ts
    ├── submission.repository.ts
    └── ... (all repositories)
```

### 2.8 Middleware

```
backend/src/middleware/
├── auth.middleware.ts          # Auth validation middleware
├── authorization.middleware.ts # Role-based auth middleware
├── error-handler.middleware.ts # Global error handler
├── request-logger.middleware.ts # Request logging
├── validation.middleware.ts    # Input validation
├── cors.middleware.ts          # CORS configuration
├── security.middleware.ts      # Security headers (Helmet)
├── rate-limit.middleware.ts    # Rate limiting
└── request-id.middleware.ts    # Request ID tracking
```

### 2.9 Utils & Helpers

```
backend/src/utils/
├── logger.ts                   # Winston logger setup
├── errors.ts                   # Custom error classes
├── validators.ts               # Common validation logic
├── hash.ts                     # Password hashing utilities
├── jwt.ts                      # JWT utilities
├── response.ts                 # Response formatting
├── pagination.ts               # Pagination helpers
├── date.ts                     # Date utilities
└── file.ts                     # File handling utilities
```

### 2.10 Configuration

```
backend/src/config/
├── index.ts                    # Main config export
├── database.config.ts          # Database connection config
├── auth.config.ts              # Auth config
├── file-upload.config.ts       # File upload paths/sizes
├── email.config.ts             # Email service config (future)
├── cors.config.ts              # CORS configuration
├── security.config.ts          # Security settings
└── constants.ts                # App-wide constants
```

### 2.11 Backend Testing Structure

```
backend/tests/
├── unit/
│   ├── auth/
│   │   ├── auth.service.test.ts
│   │   ├── auth.controller.test.ts
│   │   └── validators.test.ts
│   ├── events/
│   │   ├── event.service.test.ts
│   │   ├── event.repository.test.ts
│   │   └── validators.test.ts
│   └── utils/
│       ├── hash.test.ts
│       └── validators.test.ts
├── integration/
│   ├── auth.integration.test.ts
│   ├── events.integration.test.ts
│   ├── submissions.integration.test.ts
│   ├── uploads.integration.test.ts
│   └── admin.integration.test.ts
├── api/
│   ├── auth.api.test.ts
│   ├── events.api.test.ts
│   ├── submissions.api.test.ts
│   └── admin.api.test.ts
├── fixtures/
│   ├── user.fixtures.ts
│   ├── event.fixtures.ts
│   ├── organizer.fixtures.ts
│   └── submission.fixtures.ts
├── setup.ts                    # Test environment setup
└── teardown.ts                 # Test cleanup
```

---

## 3. Frontend Structure (Next.js)

### 3.1 Root Frontend Directory

```
frontend/
├── app/                        # Next.js app directory
├── components/                 # Reusable components
├── lib/                        # Utilities and helpers
├── styles/                     # Global styles
├── public/                     # Static assets
├── tests/                      # Test files
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js config
├── README.md                   # Frontend-specific setup
└── Dockerfile                  # Docker config
```

### 3.2 App Directory Structure

```
frontend/app/
├── layout.tsx                  # Root layout
├── page.tsx                    # Landing page (/)
├── not-found.tsx               # 404 page
├── error.tsx                   # Error page
├── (public)/                   # Public route group
│   ├── page.tsx                # Redirect to landing
│   ├── discover/
│   │   ├── page.tsx            # Event discovery
│   │   ├── layout.tsx
│   │   └── [id]/
│   │       ├── page.tsx        # Event detail
│   │       └── layout.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── register/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── register-organizer/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx              # Public layout (navbar, etc.)
│   └── api/                    # Next.js API routes
│       └── ... (optional, proxy to backend)
├── (auth)/                     # Auth protected routes
│   ├── layout.tsx
│   ├── middleware.ts           # Auth check
│   └── ... (redirect if not auth)
├── (student)/                  # Student routes
│   ├── layout.tsx
│   ├── middleware.ts           # Check student role
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── saved-events/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── notifications/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── settings/
│       ├── page.tsx
│       └── layout.tsx
├── (organizer)/                # Organizer routes
│   ├── layout.tsx
│   ├── middleware.ts           # Check organizer role
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── create-event/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx        # Edit event
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── submissions/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── settings/
│       ├── page.tsx
│       └── layout.tsx
├── (admin)/                    # Admin routes
│   ├── layout.tsx
│   ├── middleware.ts           # Check admin role
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── submissions/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx        # Review submission
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── organizers/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── analytics/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── audit-log/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── settings/
│       ├── page.tsx
│       └── layout.tsx
└── api/                        # API routes (optional)
    └── ... (proxy to backend)
```

### 3.3 Components Structure

```
frontend/components/
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   ├── Breadcrumb.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Spinner.tsx
│   ├── EmptyState.tsx
│   ├── Pagination.tsx
│   ├── DataTable.tsx
│   └── StatusBadge.tsx
├── forms/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── RegisterOrganizerForm.tsx
│   ├── CreateEventForm.tsx
│   ├── EditEventForm.tsx
│   ├── FileUploadField.tsx
│   ├── FormField.tsx
│   ├── FormError.tsx
│   └── ValidationErrors.tsx
├── layouts/
│   ├── PublicLayout.tsx
│   ├── StudentLayout.tsx
│   ├── OrganizerLayout.tsx
│   ├── AdminLayout.tsx
│   ├── HeaderNav.tsx
│   ├── SidebarNav.tsx
│   └── ProtectedLayout.tsx
├── events/
│   ├── EventCard.tsx
│   ├── EventGrid.tsx
│   ├── EventList.tsx
│   ├── EventDetail.tsx
│   ├── EventSearch.tsx
│   ├── EventFilters.tsx
│   ├── EventPoster.tsx
│   ├── EventActions.tsx
│   └── EventStatusBadge.tsx
├── dashboard/
│   ├── DashboardCard.tsx
│   ├── StatWidget.tsx
│   ├── RecentActivity.tsx
│   ├── QuickActions.tsx
│   └── ActivityFeed.tsx
├── admin/
│   ├── SubmissionQueue.tsx
│   ├── SubmissionReview.tsx
│   ├── ApprovalForm.tsx
│   ├── RejectionForm.tsx
│   ├── ChangeRequestForm.tsx
│   ├── EventManagementTable.tsx
│   ├── OrganizerManagementTable.tsx
│   ├── CategoryManager.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── AuditLogViewer.tsx
│   └── AdminStats.tsx
├── notifications/
│   ├── NotificationBell.tsx
│   ├── NotificationDropdown.tsx
│   ├── NotificationItem.tsx
│   └── NotificationList.tsx
└── profile/
    ├── UserProfile.tsx
    ├── OrganizerProfile.tsx
    ├── EditProfileForm.tsx
    ├── ChangePasswordForm.tsx
    └── ProfileSidebar.tsx
```

### 3.4 Lib Structure

```
frontend/lib/
├── api.ts                      # API client (axios/fetch wrapper)
├── api-routes.ts               # API endpoint constants
├── auth.ts                     # Auth utilities
├── context/
│   ├── AuthContext.tsx         # Auth state management
│   ├── NotificationContext.tsx # Notification state
│   └── AppContext.tsx          # Global app state
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── useUser.ts              # User data hook
│   ├── useEvents.ts            # Events hook
│   ├── useNotifications.ts     # Notifications hook
│   ├── usePagination.ts        # Pagination hook
│   ├── useForm.ts              # Form handling hook
│   ├── useFetch.ts             # Data fetching hook
│   └── useLocalStorage.ts      # Local storage hook
├── validators/
│   ├── auth.validators.ts      # Auth validation
│   ├── event.validators.ts     # Event validation
│   └── common.validators.ts    # Common validation
├── utils/
│   ├── format.ts               # Formatting utilities
│   ├── date.ts                 # Date utilities
│   ├── string.ts               # String utilities
│   ├── api-error.ts            # API error handling
│   ├── localStorage.ts         # Local storage utils
│   └── constants.ts            # App constants
├── types/
│   ├── api.ts                  # API types
│   ├── auth.ts                 # Auth types
│   ├── user.ts                 # User types
│   ├── event.ts                # Event types
│   ├── submission.ts           # Submission types
│   ├── admin.ts                # Admin types
│   └── index.ts                # Type exports
└── zustand/
    ├── authStore.ts            # Auth store
    ├── userStore.ts            # User store
    ├── eventsStore.ts          # Events store
    └── notificationStore.ts    # Notification store
```

### 3.5 Styles Structure

```
frontend/styles/
├── globals.css                 # Global styles
├── variables.css               # CSS variables
├── typography.css              # Typography styles
├── forms.css                   # Form styles
├── components.css              # Component styles
├── animations.css              # Animation definitions
├── responsive.css              # Responsive utilities
└── themes/
    ├── light.css
    ├── dark.css
    └── variables.css
```

### 3.6 Frontend Tests

```
frontend/tests/
├── unit/
│   ├── lib/
│   │   ├── validators.test.ts
│   │   ├── format.test.ts
│   │   └── api-error.test.ts
│   ├── utils/
│   │   └── ... test files
│   └── hooks/
│       ├── useAuth.test.ts
│       ├── useForm.test.ts
│       └── ...
├── integration/
│   ├── auth.integration.test.ts
│   ├── events.integration.test.ts
│   ├── submissions.integration.test.ts
│   └── admin.integration.test.ts
├── e2e/
│   ├── auth.e2e.test.ts
│   ├── event-discovery.e2e.test.ts
│   ├── organizer-workflow.e2e.test.ts
│   └── admin-workflow.e2e.test.ts
├── components/
│   ├── Button.test.tsx
│   ├── EventCard.test.tsx
│   ├── forms/
│   │   ├── LoginForm.test.tsx
│   │   └── CreateEventForm.test.tsx
│   └── ...
├── fixtures/
│   ├── user.fixtures.ts
│   ├── event.fixtures.ts
│   └── submission.fixtures.ts
└── setup.ts
```

---

## 4. Mobile Application Structure (Flutter)

### 4.1 Flutter App Root

```
mobile/
├── lib/
│   ├── main.dart               # App entry point
│   ├── config/
│   │   ├── app_config.dart
│   │   ├── api_config.dart
│   │   ├── theme_config.dart
│   │   └── routes.dart
│   ├── screens/
│   │   ├── splash/
│   │   │   └── splash_screen.dart
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── register_screen.dart
│   │   │   └── register_organizer_screen.dart
│   │   ├── student/
│   │   │   ├── home_screen.dart
│   │   │   ├── event_discovery_screen.dart
│   │   │   ├── event_detail_screen.dart
│   │   │   ├── saved_events_screen.dart
│   │   │   ├── notifications_screen.dart
│   │   │   ├── profile_screen.dart
│   │   │   └── dashboard_screen.dart
│   │   ├── organizer/
│   │   │   ├── organizer_dashboard_screen.dart
│   │   │   ├── create_event_screen.dart
│   │   │   ├── edit_event_screen.dart
│   │   │   ├── my_events_screen.dart
│   │   │   ├── submission_status_screen.dart
│   │   │   └── organizer_profile_screen.dart
│   │   └── admin/
│   │       ├── admin_dashboard_screen.dart
│   │       ├── submission_queue_screen.dart
│   │       ├── submission_detail_screen.dart
│   │       ├── event_management_screen.dart
│   │       ├── organizer_management_screen.dart
│   │       └── analytics_screen.dart
│   ├── widgets/
│   │   ├── common/
│   │   │   ├── app_bar.dart
│   │   │   ├── bottom_nav.dart
│   │   │   ├── drawer.dart
│   │   │   ├── loading_indicator.dart
│   │   │   ├── empty_state.dart
│   │   │   ├── error_widget.dart
│   │   │   ├── custom_button.dart
│   │   │   ├── custom_card.dart
│   │   │   └── custom_text_field.dart
│   │   ├── events/
│   │   │   ├── event_card.dart
│   │   │   ├── event_grid.dart
│   │   │   ├── event_list.dart
│   │   │   ├── event_search_bar.dart
│   │   │   ├── event_filter_sheet.dart
│   │   │   └── event_poster.dart
│   │   ├── forms/
│   │   │   ├── login_form.dart
│   │   │   ├── register_form.dart
│   │   │   ├── create_event_form.dart
│   │   │   ├── file_picker_field.dart
│   │   │   └── form_field.dart
│   │   └── admin/
│   │       ├── submission_item.dart
│   │       ├── approval_form.dart
│   │       ├── rejection_form.dart
│   │       └── event_table.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── organizer.dart
│   │   ├── event.dart
│   │   ├── submission.dart
│   │   ├── notification.dart
│   │   ├── category.dart
│   │   ├── response_model.dart
│   │   └── error_model.dart
│   ├── services/
│   │   ├── api_service.dart    # HTTP client
│   │   ├── auth_service.dart   # Auth logic
│   │   ├── event_service.dart  # Event API calls
│   │   ├── submission_service.dart
│   │   ├── user_service.dart
│   │   ├── notification_service.dart
│   │   ├── local_storage_service.dart
│   │   └── image_picker_service.dart
│   ├── providers/              # State management (Provider/Riverpod)
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── event_provider.dart
│   │   ├── submission_provider.dart
│   │   ├── notification_provider.dart
│   │   └── app_provider.dart
│   ├── utils/
│   │   ├── app_colors.dart
│   │   ├── app_fonts.dart
│   │   ├── constants.dart
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   ├── date_utils.dart
│   │   └── api_utils.dart
│   └── database/
│       ├── db_helper.dart      # SQLite setup
│       └── models/
│           ├── user_local.dart
│           └── event_local.dart
├── test/
│   ├── unit/
│   │   ├── models/
│   │   │   └── user_test.dart
│   │   ├── services/
│   │   │   ├── auth_service_test.dart
│   │   │   └── api_service_test.dart
│   │   └── utils/
│   │       └── validators_test.dart
│   ├── widget/
│   │   ├── login_screen_test.dart
│   │   ├── event_card_test.dart
│   │   └── event_discovery_test.dart
│   └── mocks/
│       ├── mock_services.dart
│       └── fixtures.dart
├── pubspec.yaml                # Dependencies
├── pubspec.lock
├── analysis_options.yaml       # Lint config
├── .env.example                # Environment template
├── README.md                   # Mobile setup
└── Dockerfile                  # Docker config (optional)
```

---

## 5. Documentation Structure

```
docs/
├── architecture.md             # System architecture overview
├── database.md                 # Database schema (link to DATABASE_DESIGN.md)
├── api.md                      # API endpoint reference
│   ├── auth-api.md            # Auth endpoints
│   ├── events-api.md          # Event endpoints
│   ├── submissions-api.md     # Submission endpoints
│   ├── admin-api.md           # Admin endpoints
│   └── examples.md            # cURL/REST examples
├── development.md              # Developer setup guide
├── testing.md                  # Testing strategy
├── data-strategy.md            # Data import/export strategy
├── security.md                 # Security practices
├── deployment.md               # Deployment guide
├── future-ai-architecture.md   # Phase 2 planning
├── contributing.md             # Contributing guidelines
└── troubleshooting.md          # Common issues & fixes
```

---

## 6. Data Directory Structure

```
data/
├── raw/                        # Original data sources
│   └── .gitkeep
├── processed/                  # Processed/cleaned data
│   └── .gitkeep
├── imports/                    # Import templates
│   ├── events-import-template.csv
│   ├── events-import-template.json
│   └── README.md               # Import format documentation
├── exports/                    # Data exports (git-ignored)
│   └── .gitkeep
├── seeds/                      # Seed data for development
│   ├── categories.json
│   ├── sample-events.json
│   └── sample-organizers.json
└── backups/                    # Database backups (git-ignored)
    └── .gitkeep
```

---

## 7. Environment Configuration Files

### 7.1 Root .env.example

```
# Backend
BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_event_scanner
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_event_scanner
DB_USER=postgres
DB_PASSWORD=

# Authentication
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# File Upload
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Email (Future)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=http://localhost:3000

# Security
SESSION_SECRET=your_session_secret_here
SECURE_COOKIES=false
```

### 7.2 .gitignore

```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/
.flutter/
.pub/

# Build outputs
build/
dist/
.next/
out/
.dart_tool/

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Uploads
uploads/
temp/

# Database
*.db
*.sqlite
pgdata/
```

---

## 8. Configuration Files Summary

### Backend Config Files
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Test runner configuration
- `.eslintrc.json` - Linting rules
- `.prettierrc` - Code formatting
- `Dockerfile` - Container image
- `docker-compose.yml` - Local development stack

### Frontend Config Files
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `jest.config.js` - Test configuration
- `.eslintrc.json` - Linting rules
- `Dockerfile` - Container image

### Mobile Config Files
- `pubspec.yaml` - Flutter dependencies
- `analysis_options.yaml` - Linting configuration
- `.env.example` - Environment variables

---

## 9. Key Organizational Principles

### 9.1 Module Organization

Each feature module includes:
- Controller/Screen (HTTP handlers or UI)
- Service (Business logic)
- Repository/Provider (Data access)
- Validators (Input validation)
- Types/Models (Data structures)
- Routes (Endpoint definitions)
- Tests (Unit, integration)

### 9.2 Separation of Concerns

```
Routes (HTTP/UI)
  ↓
Controllers/Screens (HTTP/UI logic)
  ↓
Services (Business logic)
  ↓
Repositories/Providers (Data access)
  ↓
Database (Persistence)
```

### 9.3 Testing Pyramid

```
         E2E Tests (few)
              ↑
       Integration Tests
              ↑
        Unit Tests (many)
```

### 9.4 Code Reusability

- **Components**: Reusable UI building blocks
- **Services**: Shared business logic
- **Hooks/Providers**: Shared state management
- **Utils**: Shared utilities
- **Types**: Shared data structures

---

## 10. Navigation & Routes

### 10.1 Route Naming Convention

```
/api/v1/{resource}              # List/create
/api/v1/{resource}/{id}         # Get/update/delete
/api/v1/{resource}/{id}/{action} # Specific action
/api/v1/admin/{resource}        # Admin endpoints
```

### 10.2 Frontend Routes

```
Public:
  /                              # Landing
  /discover                      # Event discovery
  /events/{id}                   # Event detail
  /login                         # Login
  /register                      # Register (student)
  /register-organizer            # Register (organizer)

Student:
  /dashboard                     # Student dashboard
  /saved-events                  # Bookmarks
  /notifications                 # Notifications
  /profile                       # Profile

Organizer:
  /dashboard                     # Organizer dashboard
  /create-event                  # Create event
  /events                        # My events
  /events/{id}/edit              # Edit event
  /submissions                   # Submission status

Admin:
  /admin/dashboard               # Admin dashboard
  /admin/submissions             # Pending queue
  /admin/submissions/{id}        # Review submission
  /admin/events                  # Event management
  /admin/organizers              # Organizer management
  /admin/categories              # Manage categories
  /admin/analytics               # Analytics
  /admin/audit-log               # Audit history
```

---

## 11. File Size Guidelines

### Backend
- Controllers: 200-300 lines
- Services: 300-500 lines
- Repositories: 200-300 lines
- Tests: Similar to tested module

### Frontend
- Pages: 200-300 lines
- Components: 100-200 lines
- Hooks: 50-150 lines
- Utils: 50-150 lines

### Mobile
- Screens: 200-400 lines
- Widgets: 100-200 lines
- Services: 100-300 lines

**Principle**: Break into smaller files if exceeding limits.

---

## 12. Dependency Graph

```
Frontend (Next.js)
    ↓
Backend API (Express + Prisma)
    ↓
Database (PostgreSQL)

Mobile (Flutter)
    ↓
Backend API (Express + Prisma)
    ↓
Database (PostgreSQL)
```

---

## 13. Asset Management

### 13.1 Frontend Static Assets

```
frontend/public/
├── images/
│   ├── logo.svg
│   ├── hero.jpg
│   ├── icons/
│   │   ├── event.svg
│   │   ├── category.svg
│   │   └── ...
│   └── ...
├── fonts/
├── favicon.ico
└── manifest.json
```

### 13.2 Mobile Assets

```
mobile/assets/
├── images/
├── icons/
├── fonts/
└── lottie/
```

---

## 14. Deployment Structure

### 14.1 Docker Containers

```
- PostgreSQL (database)
- Backend (Node.js/Express)
- Frontend (Next.js)
- Mobile (optional: Flutter web)
```

### 14.2 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  backend:
    build: ./backend
    depends_on:
      - postgres
    ports:
      - "3001:3001"
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

---

## Summary

This structure provides:

✓ **Modularity**: Each feature has clear boundaries  
✓ **Maintainability**: Easy to locate and modify code  
✓ **Scalability**: Can add new features without disruption  
✓ **Testability**: Clear separation for unit/integration/E2E tests  
✓ **Team Collaboration**: Clear role definitions  
✓ **Documentation**: Organized docs for each component  
✓ **Development Speed**: Standard patterns reduce decision-making  

---

**Next Document**: IMPLEMENTATION PLAN
