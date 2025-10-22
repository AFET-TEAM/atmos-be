-- Add deleted_at to main entities (idempotent)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'about_me',
    'comments',
    'documents',
    'ideas',
    'likes',
    'meetings',
    'meeting_attendees',
    'reports',
    'tasks',
    'team_memberships',
    'teams',
    'techtalks',
    'users'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'deleted_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_at timestamptz;', tbl);
    END IF;

    -- Soft-delete sorguları hızlandırmak için index
    EXECUTE format('CREATE INDEX IF NOT EXISTS ix_%I_deleted_at ON public.%I (deleted_at);', tbl, tbl);
  END LOOP;
END$$;

-- === Partial unique indexes (aktif kayıtlar için) ===
-- Not: Bunlar mevcut UNIQUE CONSTRAINT'leri "aktif satırlar" (deleted_at IS NULL) ile sınırlar.
-- Postgres'te partial unique "constraint" değil "index" olarak tanımlanır.

-- about_me.user_id tekil
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_me_user_id_key') THEN
    ALTER TABLE public.about_me DROP CONSTRAINT about_me_user_id_key;
  END IF;
END$$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_about_me_user_id_active
  ON public.about_me (user_id) WHERE deleted_at IS NULL;

-- likes (user_id, target_type, target_id) tekil
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_target_type_target_id_key') THEN
    ALTER TABLE public.likes DROP CONSTRAINT likes_user_id_target_type_target_id_key;
  END IF;
END$$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_likes_active
  ON public.likes (user_id, target_type, target_id) WHERE deleted_at IS NULL;

-- team_memberships (team_id, user_id) tekil
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_memberships_team_id_user_id_key') THEN
    ALTER TABLE public.team_memberships DROP CONSTRAINT team_memberships_team_id_user_id_key;
  END IF;
END$$;
CREATE UNIQUE INDEX IF NOT EXISTS ux_team_memberships_active
  ON public.team_memberships (team_id, user_id) WHERE deleted_at IS NULL;

-- (Opsiyonel) users.email tekilliğini soft-delete uyumlu yapmak istersen:
-- ÖNEMLİ: Bu değişiklik aynı email ile yeni kullanıcı açılmasına (eski soft-deleted ise) izin verir.
-- Aşağıdaki bloğu İSTİYORSAN aktif et.
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
--     ALTER TABLE public.users DROP CONSTRAINT users_email_key;
--   END IF;
-- END$$;
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_active
--   ON public.users (email) WHERE deleted_at IS NULL;
