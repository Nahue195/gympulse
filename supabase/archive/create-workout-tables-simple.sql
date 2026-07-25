-- ==========================================
-- CREAR TABLAS DE ENTRENAMIENTO (SIMPLE)
-- ==========================================
-- Ejecuta este script en Supabase SQL Editor

-- ==========================================
-- TABLA: workouts
-- ==========================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  routine_name TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: workout_entries
-- ==========================================
CREATE TABLE IF NOT EXISTS workout_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps_per_set TEXT,
  weight_per_set TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  rpe INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLA: gym_checkins
-- ==========================================
CREATE TABLE IF NOT EXISTS gym_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  linked_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Verificar que se crearon
SELECT 'workouts' as tabla, COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'workouts'
UNION ALL
SELECT 'workout_entries', COUNT(*)
FROM information_schema.columns
WHERE table_name = 'workout_entries'
UNION ALL
SELECT 'gym_checkins', COUNT(*)
FROM information_schema.columns
WHERE table_name = 'gym_checkins';
