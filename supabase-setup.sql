-- ============================================
-- Yuxzeh 地图解锁网站 - 数据库建表 SQL
-- 在 Supabase SQL Editor 中粘贴全部内容，点 Run 执行
-- ============================================

-- 1. 用户扩展信息表
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 点亮区域表
CREATE TABLE lit_regions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  level       TEXT NOT NULL,
  lit_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, region_code)
);

-- 3. 旅行日记表
CREATE TABLE diaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 启用行级安全
ALTER TABLE lit_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 5. 权限策略（每人只能看/改自己的数据）
CREATE POLICY "own_lit_select"  ON lit_regions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_lit_insert"  ON lit_regions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_lit_delete"  ON lit_regions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "own_diary_select" ON diaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_diary_insert" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_diary_update" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_diary_delete" ON diaries FOR DELETE USING (auth.uid() = user_id);
