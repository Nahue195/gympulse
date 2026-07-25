-- =============================================
-- 0015 — Rellenar schema faltante
-- =============================================
-- Estos objetos existían en la base de datos en producción pero nunca se
-- guardaron en un archivo SQL (se corrieron a mano en el editor de Supabase).
-- Esta migración los reconstruye para que el schema sea 100% reproducible.
-- Es idempotente: se puede correr sobre una base existente sin romper nada.

-- ---------------------------------------------
-- Tabla follows (relaciones de seguimiento)
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow" ON follows;
CREATE POLICY "Users can follow"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ---------------------------------------------
-- Columnas faltantes en users
-- ---------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rest_timer_seconds INTEGER NOT NULL DEFAULT 90;

-- Nota: los triggers que mantienen followers_count / following_count viven en
-- 0009_fix_follow_counts.sql (se ejecuta después de esta migración, por lo que
-- las columnas ya existen cuando ese script las actualiza).
