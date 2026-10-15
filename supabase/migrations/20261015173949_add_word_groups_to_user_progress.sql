/*
# Add word_groups column to user_progress

1. Modified Tables
- `user_progress`
  - Added `word_groups` (jsonb, default '[]') — array of custom word groups.
    Each group: { id: string, name: string, hanziIds: string[] }
    Stores user-created groups of dictionary words for targeted study ("штурм").

2. Security
- No policy changes — existing anon/authenticated CRUD policies already cover the new column.
*/

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS word_groups jsonb NOT NULL DEFAULT '[]'::jsonb;
