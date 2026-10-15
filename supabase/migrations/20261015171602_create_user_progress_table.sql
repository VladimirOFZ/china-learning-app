/*
# Create user_progress table (single-tenant, no auth)

1. New Tables
- `user_progress`
  - `device_id` (text, primary key) — unique browser/device identifier generated client-side
  - `streak` (integer, default 1) — current consecutive-day streak
  - `last_visit` (text) — date string of last visit (toDateString format)
  - `mastered_hanzi` (text array, default '{}') — list of mastered hanzi IDs
  - `quiz_high_score` (integer, default 0) — best quiz score
  - `quiz_completed` (integer, default 0) — number of quizzes completed
  - `total_quiz_answered` (integer, default 0) — total questions answered across all quizzes
  - `total_correct` (integer, default 0) — total correct answers across all quizzes
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `user_progress`.
- Allow anon + authenticated full CRUD because the app has no sign-in and data is keyed by device_id (intentionally public/shared).
*/

CREATE TABLE IF NOT EXISTS user_progress (
  device_id text PRIMARY KEY,
  streak integer NOT NULL DEFAULT 1,
  last_visit text NOT NULL DEFAULT '',
  mastered_hanzi text[] NOT NULL DEFAULT '{}',
  quiz_high_score integer NOT NULL DEFAULT 0,
  quiz_completed integer NOT NULL DEFAULT 0,
  total_quiz_answered integer NOT NULL DEFAULT 0,
  total_correct integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON user_progress;
CREATE POLICY "anon_select_progress" ON user_progress
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON user_progress;
CREATE POLICY "anon_insert_progress" ON user_progress
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON user_progress;
CREATE POLICY "anon_update_progress" ON user_progress
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON user_progress;
CREATE POLICY "anon_delete_progress" ON user_progress
  FOR DELETE TO anon, authenticated USING (true);
