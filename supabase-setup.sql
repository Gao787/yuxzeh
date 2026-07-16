-- ============================================
-- Yuxzeh - 数据库建表 SQL
-- 全选 → Supabase SQL Editor → Run
-- ============================================

-- 1. 用户扩展信息表
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT UNIQUE NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. 点亮区域表
CREATE TABLE IF NOT EXISTS lit_regions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  level       TEXT NOT NULL,
  lit_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, region_code)
);
ALTER TABLE lit_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lit_select" ON lit_regions;
DROP POLICY IF EXISTS "lit_insert" ON lit_regions;
DROP POLICY IF EXISTS "lit_delete" ON lit_regions;
CREATE POLICY "lit_select" ON lit_regions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lit_insert" ON lit_regions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lit_delete" ON lit_regions FOR DELETE USING (auth.uid() = user_id);

-- 3. 旅行日记表
CREATE TABLE IF NOT EXISTS diaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diary_select" ON diaries;
DROP POLICY IF EXISTS "diary_insert" ON diaries;
DROP POLICY IF EXISTS "diary_update" ON diaries;
DROP POLICY IF EXISTS "diary_delete" ON diaries;
CREATE POLICY "diary_select" ON diaries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "diary_insert" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diary_update" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diary_delete" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- 4. 留言板表
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  parent_id   UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select" ON messages;
DROP POLICY IF EXISTS "msg_insert" ON messages;
DROP POLICY IF EXISTS "msg_delete" ON messages;
CREATE POLICY "msg_select" ON messages FOR SELECT USING (true);
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "msg_delete" ON messages FOR DELETE USING (auth.uid() = user_id);

-- 5. 我们的回忆表
CREATE TABLE IF NOT EXISTS memories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  image       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  date        TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mem_select" ON memories;
DROP POLICY IF EXISTS "mem_insert" ON memories;
DROP POLICY IF EXISTS "mem_delete" ON memories;
CREATE POLICY "mem_select" ON memories FOR SELECT USING (true);
CREATE POLICY "mem_insert" ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mem_delete" ON memories FOR DELETE USING (auth.uid() = user_id);
