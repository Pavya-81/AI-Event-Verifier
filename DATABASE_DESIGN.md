# Database Design: AI Event Quality & Verification Scanner - Phase 1

**Document Status**: Phase 1 Planning  
**Database**: PostgreSQL  
**Date**: 2026-09-01

---

## Executive Summary

This document specifies the complete PostgreSQL relational schema for Phase 1. The design emphasizes:

- **Normalization**: Data integrity and efficient queries
- **Audit Trail**: Complete history preservation for future AI analysis
- **Event Versioning**: Track all changes to events
- **Submission History**: Never lose submission workflow data
- **File Management**: Preserve original uploads
- **Extensibility**: Support future AI verification tables
- **Performance**: Appropriate indexes and constraints

---

## 1. Core Principle: Data Preservation

**Never Lose Information**:
- Original event descriptions are preserved
- Event versions track all changes
- Submission history is immutable
- Original uploaded files are never transformed
- Audit logs record all actions

**Why**: The future AI verification system will analyze original content, track changes over time, and learn from verified outcomes.

---

## 2. Table Definitions

### 2.1 Users Table

**Purpose**: Core user account records  
**Used By**: Authentication, authorization, audit

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url VARCHAR(500) NULL,
  phone_number VARCHAR(20) NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT email_not_empty CHECK (email != ''),
  CONSTRAINT password_not_empty CHECK (password_hash != '')
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
```

**Key Decisions**:
- Email is unique and used for login
- Password stored only as bcrypt hash
- Full name generated for convenience
- Soft delete via deleted_at
- is_active allows temporary suspension
- Timestamps for audit

---

### 2.2 Roles Table

**Purpose**: Define available roles  
**Used By**: Authorization, user role mapping

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_role_name CHECK (name IN ('student', 'organizer', 'admin'))
);

-- Insert base roles
INSERT INTO roles (name, display_name, description) VALUES
  ('student', 'Student', 'Browse and bookmark events'),
  ('organizer', 'Event Organizer', 'Create and submit events'),
  ('admin', 'Administrator', 'Manage events and organizers');
```

**Key Decisions**:
- Limited to three roles: student, organizer, admin
- Roles are seeded, not user-created
- Permissions stored as array for future expansion

---

### 2.3 User Roles Junction Table

**Purpose**: Map users to roles (many-to-many)  
**Used By**: Authorization checks

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID NULL,
  
  CONSTRAINT fk_user_roles_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_user_roles_assigned_by 
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_user_role 
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

**Key Decisions**:
- Users can have multiple roles
- Unique constraint prevents duplicate role assignments
- assigned_by tracks who made the assignment

---

### 2.4 Organizers Table

**Purpose**: Organization profiles  
**Used By**: Event creation, organizer browsing, admin management

```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  organization_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NULL,
  website_url VARCHAR(500) NULL,
  logo_url VARCHAR(500) NULL,
  address TEXT NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(50) NULL,
  zip_code VARCHAR(20) NULL,
  country VARCHAR(100) NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  verified_by UUID NULL,
  event_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT fk_organizers_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_organizers_verified_by 
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT org_name_not_empty CHECK (organization_name != '')
);

CREATE INDEX idx_organizers_user ON organizers(user_id);
CREATE INDEX idx_organizers_verified ON organizers(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizers_created_at ON organizers(created_at);
```

**Key Decisions**:
- One organizer profile per user
- is_verified for admin verification of organizer legitimacy
- Full contact info stored
- event_count for quick statistics
- Soft delete preserves organizer history

---

### 2.5 Event Categories Table

**Purpose**: Category taxonomy for events  
**Used By**: Event filtering, categorization, admin management

```sql
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  icon_url VARCHAR(500) NULL,
  color_hex VARCHAR(7) NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT category_name_not_empty CHECK (name != '')
);

CREATE INDEX idx_event_categories_active ON event_categories(is_active) 
  WHERE deleted_at IS NULL;
CREATE INDEX idx_event_categories_sort ON event_categories(sort_order);

-- Insert default categories
INSERT INTO event_categories (name, display_name, sort_order) VALUES
  ('academic', 'Academic', 1),
  ('workshop', 'Workshop', 2),
  ('social', 'Social', 3),
  ('sports', 'Sports', 4),
  ('cultural', 'Cultural', 5),
  ('networking', 'Networking', 6),
  ('other', 'Other', 7);
```

**Key Decisions**:
- Categories are admin-managed, not user-created
- color_hex for UI customization
- sort_order for custom ordering
- Categories are soft-deletable
- Reasonable defaults provided

---

### 2.6 Events Table

**Purpose**: Main event records  
**Used By**: Event discovery, creation, editing, submission

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  category_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  location_address TEXT NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(50) NULL,
  location_zip VARCHAR(20) NULL,
  location_country VARCHAR(100) DEFAULT 'USA',
  registration_url VARCHAR(500) NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NULL,
  
  status VARCHAR(50) DEFAULT 'draft',
  status_changed_at TIMESTAMP NULL,
  
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  
  latest_submission_id UUID NULL,
  latest_version_id UUID NULL,
  latest_poster_id UUID NULL,
  
  view_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,
  registration_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT fk_events_organizer 
    FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_category 
    FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_events_latest_submission
    FOREIGN KEY (latest_submission_id) REFERENCES event_submissions(id) ON DELETE SET NULL,
  CONSTRAINT fk_events_latest_version
    FOREIGN KEY (latest_version_id) REFERENCES event_versions(id) ON DELETE SET NULL,
  CONSTRAINT fk_events_latest_poster
    FOREIGN KEY (latest_poster_id) REFERENCES event_posters(id) ON DELETE SET NULL,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'pending_review', 'approved', 'rejected', 'changes_requested')),
  CONSTRAINT title_not_empty CHECK (title != ''),
  CONSTRAINT description_not_empty CHECK (description != ''),
  CONSTRAINT times_valid CHECK (start_time < end_time),
  CONSTRAINT dates_valid CHECK (event_date >= CURRENT_DATE)
);

CREATE INDEX idx_events_organizer ON events(organizer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_published ON events(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_date ON events(event_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_title ON events(title) USING GIN (to_tsvector('english', title));
CREATE INDEX idx_events_description ON events(description) USING GIN (to_tsvector('english', description));
CREATE INDEX idx_events_location ON events(location_city, location_state) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_created_at ON events(created_at);
```

**Key Decisions**:
- Status tracks event lifecycle (NOT binary published)
- status_changed_at tracks when status last changed
- latest_submission_id, latest_version_id, latest_poster_id are denormalized references (optimization + consistency)
- Full location stored (city, state, zip, country) for filtering and geo-queries
- View/bookmark/registration counts for quick stats
- Soft delete preserves event history
- Full-text search indexes on title and description
- Constraints prevent invalid dates/times

---

### 2.7 Event Versions Table

**Purpose**: Immutable snapshots of event changes  
**Used By**: Audit trail, change tracking, AI analysis

```sql
CREATE TABLE event_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  submission_id UUID NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  location_address TEXT NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  
  registration_url VARCHAR(500) NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NULL,
  
  poster_id UUID NULL,
  
  version_number INT NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  change_reason TEXT NULL,
  
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_versions_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_versions_submission
    FOREIGN KEY (submission_id) REFERENCES event_submissions(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_versions_category 
    FOREIGN KEY (category_id) REFERENCES event_categories(id),
  CONSTRAINT fk_event_versions_poster
    FOREIGN KEY (poster_id) REFERENCES event_posters(id) ON DELETE SET NULL,
  CONSTRAINT fk_event_versions_changed_by 
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT valid_change_type CHECK (change_type IN ('created', 'draft_update', 'submission', 'admin_rejection', 'admin_changes_requested', 'organizer_resubmit'))
);

CREATE INDEX idx_event_versions_event ON event_versions(event_id);
CREATE INDEX idx_event_versions_submission ON event_versions(submission_id);
CREATE INDEX idx_event_versions_changed_at ON event_versions(changed_at);
```

**Important**: All columns from events are denormalized here. This is intentional because:
- Versions must be immutable (no updates)
- AI system needs to compare versions
- Change history must be preserved forever
- Can't rely on joining to events table (it might change)

---

### 2.8 Event Submissions Table

**Purpose**: Track event submission workflow  
**Used By**: Admin review queue, organizer feedback, audit trail

```sql
CREATE TABLE event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'submitted',
  
  reviewed_by UUID NULL,
  reviewed_at TIMESTAMP NULL,
  
  rejection_reason TEXT NULL,
  requested_changes JSONB NULL,
  admin_notes TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_submissions_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_organizer 
    FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_reviewed_by 
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT valid_submission_status CHECK (status IN ('submitted', 'pending_review', 'approved', 'rejected', 'changes_requested')),
  CONSTRAINT reason_required_if_rejected CHECK (
    (status != 'rejected') OR (rejection_reason IS NOT NULL)
  )
);

CREATE INDEX idx_submissions_event ON event_submissions(event_id);
CREATE INDEX idx_submissions_organizer ON event_submissions(organizer_id);
CREATE INDEX idx_submissions_status ON event_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON event_submissions(submitted_at);
CREATE INDEX idx_submissions_reviewed_at ON event_submissions(reviewed_at);
```

**Key Decisions**:
- Never delete submissions (complete audit trail)
- requested_changes stored as JSONB for flexible schema
- rejection_reason required when status is rejected (constraint)
- reviewed_by and reviewed_at track admin decision
- status mirrors event status but is independent record

---

### 2.9 Event Posters Table

**Purpose**: Track uploaded poster images  
**Used By**: Event display, file management, AI poster analysis

```sql
CREATE TABLE event_posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  
  original_filename VARCHAR(500) NOT NULL,
  stored_filename VARCHAR(500) NOT NULL UNIQUE,
  file_path VARCHAR(1000) NOT NULL,
  
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  width INT NULL,
  height INT NULL,
  
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  is_primary BOOLEAN DEFAULT TRUE,
  
  virus_scan_status VARCHAR(50) DEFAULT 'pending',
  virus_scan_result TEXT NULL,
  virus_scan_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT fk_posters_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_posters_uploaded_by 
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT valid_mime_type CHECK (mime_type LIKE 'image/%'),
  CONSTRAINT file_size_valid CHECK (file_size > 0 AND file_size <= 5242880)
);

CREATE INDEX idx_posters_event ON event_posters(event_id);
CREATE INDEX idx_posters_uploaded_at ON event_posters(uploaded_at);
CREATE INDEX idx_posters_primary ON event_posters(is_primary) WHERE deleted_at IS NULL;
```

**Key Decisions**:
- Original filename preserved for user reference
- Stored filename is hash-based for security
- File path points to disk storage (not DB)
- Original file is NEVER transformed (AI needs it)
- Virus scan tracking for security
- Image dimensions stored for responsive display
- Soft delete preserves history
- MIME type validation

---

### 2.10 Event Bookmarks Table

**Purpose**: User-saved events  
**Used By**: Student dashboard, saved events list

```sql
CREATE TABLE event_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_bookmarks_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_bookmark 
    UNIQUE(user_id, event_id)
);

CREATE INDEX idx_bookmarks_user ON event_bookmarks(user_id);
CREATE INDEX idx_bookmarks_event ON event_bookmarks(event_id);
CREATE INDEX idx_bookmarks_created_at ON event_bookmarks(bookmarked_at);
```

**Key Decisions**:
- Simple many-to-many junction table
- Unique constraint prevents duplicate bookmarks
- No soft delete (not sensitive data)

---

### 2.11 Event Registrations Table

**Purpose**: Student interest/registration in events  
**Used By**: Event engagement, registration tracking

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'registered',
  
  CONSTRAINT fk_registrations_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_registrations_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_registration 
    UNIQUE(user_id, event_id),
  CONSTRAINT valid_registration_status CHECK (status IN ('registered', 'attended', 'cancelled'))
);

CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);
```

**Key Decisions**:
- Tracks student interest in events
- Status can track attendance (for future analytics)
- Unique constraint prevents duplicate registrations

---

### 2.12 Notifications Table

**Purpose**: User notification queue  
**Used By**: Admin/organizer/student notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  
  related_entity_type VARCHAR(50) NULL,
  related_entity_id UUID NULL,
  
  data JSONB NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT fk_notifications_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT valid_notification_type CHECK (type IN (
    'event_submitted',
    'event_approved',
    'event_rejected',
    'changes_requested',
    'event_published',
    'new_event_organizer'
  ))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Key Decisions**:
- data JSONB for flexible notification context
- type enum for filtering
- is_read tracks notification state
- expires_at for automatic cleanup
- Soft delete for user deletion

---

### 2.13 Audit Logs Table

**Purpose**: Complete audit trail of all important actions  
**Used By**: Compliance, debugging, AI learning, admin review

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  
  changes JSONB NULL,
  metadata JSONB NULL,
  
  ip_address INET NULL,
  user_agent TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_actor 
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT valid_action CHECK (action IN (
    'user_register',
    'user_login',
    'user_logout',
    'user_update_profile',
    'user_change_password',
    'organizer_create',
    'organizer_update',
    'event_create',
    'event_draft_update',
    'event_submit',
    'event_approve',
    'event_reject',
    'event_changes_requested',
    'poster_upload',
    'bookmark_create',
    'bookmark_delete',
    'admin_verify_organizer'
  )),
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'user',
    'organizer',
    'event',
    'submission',
    'poster',
    'bookmark'
  ))
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Key Decisions**:
- Immutable (never delete)
- changes JSONB captures before/after state
- metadata JSONB for flexible additional info
- IP and user agent for security audit
- Comprehensive action enumeration
- Can query entire audit trail by entity

---

## 3. Indexes Summary

### Performance Indexes

```sql
-- Search indexes
CREATE INDEX idx_events_title_search ON events USING GIN (to_tsvector('english', title));
CREATE INDEX idx_events_description_search ON events USING GIN (to_tsvector('english', description));

-- Filter indexes
CREATE INDEX idx_events_organizer_published ON events(organizer_id, is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_category_date ON events(category_id, event_date) WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_events_location_date ON events(location_city, event_date) WHERE is_published = true AND deleted_at IS NULL;

-- User queries
CREATE INDEX idx_users_email_active ON users(email) WHERE is_active = true AND deleted_at IS NULL;

-- Admin queue
CREATE INDEX idx_submissions_pending ON event_submissions(status) WHERE status = 'pending_review';

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE deleted_at IS NULL;
```

---

## 4. Constraints Summary

### Data Integrity Constraints

```
Users:
- Email is unique and required
- Password hash is required
- First/last name required

Events:
- Status enum (limited values)
- Title, description required
- Start time < end time
- Event date >= today
- Organizer must exist
- Category must exist

Event Submissions:
- If rejected, rejection_reason required
- Status enum
- All submissions kept forever

Event Posters:
- MIME type must be image/*
- File size max 5MB
- Original file never deleted

Bookmarks:
- One bookmark per user per event

Audit Logs:
- Action and entity_type enums
- Never deleted
```

---

## 5. Future Extensions (Not Created in Phase 1)

These tables will be added in Phase 2 for AI verification:

### event_verifications
```sql
CREATE TABLE event_verifications (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  verification_run_id UUID NOT NULL,
  status VARCHAR(50),
  quality_score DECIMAL(3, 2),
  trust_score DECIMAL(3, 2),
  risk_level VARCHAR(50),
  created_at TIMESTAMP,
  ...
)
```

### verification_runs
```sql
CREATE TABLE verification_runs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  completed_at TIMESTAMP,
  triggered_by VARCHAR(50),
  ...
)
```

### verification_findings
```sql
CREATE TABLE verification_findings (
  id UUID PRIMARY KEY,
  verification_id UUID,
  finding_type VARCHAR(100),
  severity VARCHAR(50),
  description TEXT,
  evidence JSONB,
  ...
)
```

### duplicate_candidates
```sql
CREATE TABLE duplicate_candidates (
  id UUID PRIMARY KEY,
  event_id UUID,
  candidate_event_id UUID,
  similarity_score DECIMAL(3, 2),
  ...
)
```

**Why not created now**:
- Phase 1 doesn't need them
- Can be added without breaking existing tables
- AI verification service can create them
- Current schema supports them via audit trail

---

## 6. Migrations Strategy

### Phase 1 Migrations

```
0001_init_users_roles.sql              - Create users, roles, user_roles
0002_init_organizers.sql               - Create organizers
0003_init_categories.sql               - Create event_categories (with seed)
0004_init_events.sql                   - Create events
0005_init_event_versions.sql           - Create event_versions
0006_init_event_submissions.sql        - Create event_submissions
0007_init_event_posters.sql            - Create event_posters
0008_init_event_bookmarks.sql          - Create event_bookmarks
0009_init_event_registrations.sql      - Create event_registrations
0010_init_notifications.sql            - Create notifications
0011_init_audit_logs.sql               - Create audit_logs
0012_create_indexes.sql                - Create all indexes
0013_seed_roles.sql                    - Seed default roles
0014_seed_categories.sql               - Seed event categories
```

---

## 7. Entity Relationship Diagram

```
                            users
                             |
                ╔════╦═══════╬═══════╦═════════╗
                |    |       |       |         |
            organizers |       |       |    user_roles
                |      |       |       |       |
                |    audit_  |   notifications (many)
                |      logs  |       |
                |            |       └─ roles
                |            |
            events ←──────────┘
                |
                ├─ event_versions (history)
                ├─ event_submissions (workflow)
                ├─ event_posters (files)
                ├─ event_categories
                |
                ├─ event_bookmarks ← users (many-to-many)
                └─ event_registrations ← users (many-to-many)
```

---

## 8. Normalization Analysis

### Third Normal Form (3NF) Compliance

| Table | Status | Notes |
|-------|--------|-------|
| users | 3NF | All non-key attributes depend on full PK |
| roles | 3NF | Simple reference table |
| user_roles | 3NF | Junction table, proper FK |
| organizers | 3NF | All attributes depend on organizer |
| event_categories | 3NF | Simple reference table |
| events | 3NF | All attributes about event |
| event_versions | Denormalized* | Intentional: immutable snapshots |
| event_submissions | 3NF | All attributes about submission |
| event_posters | 3NF | All attributes about poster |
| event_bookmarks | 3NF | Junction table |
| event_registrations | 3NF | Junction table |
| notifications | 3NF | Flexible JSONB for context |
| audit_logs | 3NF | Flexible JSONB for changes |

*event_versions is intentionally denormalized to preserve immutable snapshots of event state.

---

## 9. Soft Delete Strategy

### Tables Using Soft Delete

- users (deleted_at)
- organizers (deleted_at)
- events (deleted_at)
- event_categories (deleted_at)
- event_posters (deleted_at)
- notifications (deleted_at)
- audit_logs (never deleted, no soft delete)

### Query Pattern

```sql
-- Active records only
SELECT * FROM events WHERE deleted_at IS NULL;

-- Including soft deleted
SELECT * FROM events WHERE id = $1;

-- Restore
UPDATE events SET deleted_at = NULL WHERE id = $1;
```

---

## 10. Security Considerations

### Password Storage

```sql
-- Never store plaintext
-- Always use bcrypt hash
-- Example: $2b$10$ZIvWzJ3.H9RvBcXi...

UPDATE users SET password_hash = $1 WHERE id = $2;
```

### API Keys & Secrets

- NOT stored in database
- Use environment variables
- Store JWT secrets in env
- File upload paths in env

### SQL Injection Prevention

- Always use parameterized queries
- Never concatenate SQL strings
- Use ORM (Prisma/TypeORM) for safety

### Access Control

- Backend enforces all authorization
- Frontend can suggest routes but shouldn't block
- Audit log tracks who accessed what

---

## 11. Performance Considerations

### Query Optimization

**Slow queries to avoid**:
```sql
-- BAD: Full table scan
SELECT * FROM events;

-- GOOD: With filters and indexes
SELECT * FROM events 
WHERE deleted_at IS NULL 
  AND category_id = $1 
  AND is_published = true
ORDER BY event_date;
```

**N+1 Query Prevention**:
- Use JOIN for related data
- Batch queries in ORM
- Load related data in single query

### Scaling Considerations

**Current design supports**:
- Millions of events (proper indexes)
- Thousands of concurrent users
- Hundreds of thousands of audit logs

**If scaling beyond**:
- Add caching (Redis for frequent queries)
- Partition audit_logs by date
- Archive old notifications
- Read replicas for analytics queries

---

## 12. Monitoring & Maintenance

### Key Queries for Admin Monitoring

```sql
-- Event submission queue
SELECT COUNT(*) FROM event_submissions WHERE status = 'pending_review';

-- Pending audit log growth
SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours';

-- Disk space for posters
SELECT SUM(file_size) FROM event_posters WHERE deleted_at IS NULL;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Maintenance Tasks

- Regular VACUUM ANALYZE
- Monitor index bloat
- Archive old audit logs (quarterly)
- Backup strategy (nightly full, hourly incremental)

---

## Summary

**Key Design Principles**:

✓ **Complete History Preservation**: Never lose data for audit trail  
✓ **Event Versioning**: Track all changes over time  
✓ **Immutable Audit Trail**: Perfect for future AI analysis  
✓ **File Preservation**: Original uploads never transformed  
✓ **Normalized Schema**: Data integrity and efficient queries  
✓ **Soft Deletes**: Preserve relationships while marking deletion  
✓ **Proper Indexes**: Performance for search, filter, and common queries  
✓ **Extensible Design**: Easy to add future AI tables without breaking changes  

This database design supports both the current event platform requirements and future AI verification needs.

---

**Next Document**: PROJECT STRUCTURE
