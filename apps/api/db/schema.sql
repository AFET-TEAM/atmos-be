-- ============================================================================
-- ATOS Backend - PostgreSQL Database Schema
-- ============================================================================
-- Bu dosya tüm tabloları, ilişkileri ve indexleri oluşturur.
-- Kullanım: psql -U your_user -d your_database -f schema.sql

-- ============================================================================
-- 1. LOOKUP TABLES (Referans Tabloları)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS idea_assignees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CORE TABLES (Ana Tablolar)
-- ============================================================================

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  team VARCHAR(100),
  profession VARCHAR(100),
  profile_picture TEXT,
  address TEXT,
  user_department VARCHAR(100),
  directorate INTEGER REFERENCES directorates(id),
  connection BOOLEAN DEFAULT FALSE,
  user_status_id INTEGER REFERENCES user_statuses(id),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- About Me (1-1 ilişki users ile)
CREATE TABLE IF NOT EXISTS about_me (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Team Memberships (Many-to-Many: users <-> teams)
CREATE TABLE IF NOT EXISTS team_memberships (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Meeting Attendees (Many-to-Many: meetings <-> users)
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  due_date TIMESTAMPTZ,
  task_status_id INTEGER REFERENCES task_statuses(id),
  related_type VARCHAR(50), -- 'techtalk', 'document', 'report', 'idea', 'meeting'
  related_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. CONTENT TABLES (İçerik Tabloları)
-- ============================================================================

-- TechTalks
CREATE TABLE IF NOT EXISTS techtalks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  duration_min INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  file_url TEXT,
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  frontend_count INTEGER,
  backend_count INTEGER,
  idea_assignee_id INTEGER REFERENCES idea_assignees(id),
  date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Tab Headers
 CREATE TABLE IF NOT EXISTS tab_headers (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- 4. INTERACTION TABLES (Etkileşim Tabloları)
-- ============================================================================

-- Comments (Polymorphic - herhangi bir içeriğe yorum)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type VARCHAR(50) NOT NULL, -- 'techtalk', 'document', 'report', 'idea', vb.
  target_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id), -- İç içe yorumlar için
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Likes (Polymorphic - herhangi bir içeriğe beğeni)
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOT: likes tablosunda deleted_at YOK (soft delete disabled)
);


-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


--directorates
CREATE TABLE IF NOT EXISTS directorates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- ============================================================================
-- 5. INDEXES (Performans için indexler)
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- About Me indexes
CREATE INDEX IF NOT EXISTS idx_about_me_user_id ON about_me(user_id);
CREATE INDEX IF NOT EXISTS idx_about_me_deleted_at ON about_me(deleted_at);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_deleted_at ON teams(deleted_at);

-- Team Memberships indexes
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_deleted_at ON team_memberships(deleted_at);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_starts_at ON meetings(starts_at);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_deleted_at ON meetings(deleted_at);

-- Meeting Attendees indexes
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_deleted_at ON meeting_attendees(deleted_at);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);

-- Content tables indexes
CREATE INDEX IF NOT EXISTS idx_techtalks_user_id ON techtalks(user_id);
CREATE INDEX IF NOT EXISTS idx_techtalks_date ON techtalks(date);
CREATE INDEX IF NOT EXISTS idx_techtalks_deleted_at ON techtalks(deleted_at);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
CREATE INDEX IF NOT EXISTS idx_reports_deleted_at ON reports(deleted_at);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_date ON ideas(date);
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas(deleted_at);

CREATE INDEX IF NOT EXISTS idx_departments_deleted_at ON departments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_directorates_name ON directorates(name);


-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON likes(user_id, target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);

-- ============================================================================
-- 6. SEED DATA (Başlangıç Verileri)
-- ============================================================================

-- User Statuses
INSERT INTO user_statuses (name) VALUES
  ('Active'),
  ('Inactive'),
  ('Pending')
ON CONFLICT (name) DO NOTHING;

-- Task Statuses
INSERT INTO task_statuses (name) VALUES
  ('Todo'),
  ('In Progress'),
  ('Done'),
  ('Cancelled')
ON CONFLICT (name) DO NOTHING;

-- Idea Assignees
INSERT INTO idea_assignees (name) VALUES
  ('Frontend Team'),
  ('Backend Team'),
  ('DevOps Team'),
  ('Design Team')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TAMAMLANDI
-- ============================================================================
-- Şema başarıyla oluşturuldu!
-- Şimdi migration dosyasını çalıştırabilirsiniz: 2025-09-27_add_deleted_at.sql
