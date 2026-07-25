-- ==========================================
-- VERIFICAR Y CREAR TABLAS DE ENTRENAMIENTO
-- ==========================================

-- Ver todas las tablas que ya existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ==========================================
-- TABLA: workouts
-- Almacena los entrenamientos completados
-- ==========================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  routine_name TEXT NOT NULL,
  workout_type TEXT NOT NULL, -- 'Fuerza', 'Cardio', etc.
  duration_minutes INT,
  notes TEXT,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC', 'PRIVATE', 'FRIENDS'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para workouts
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);

-- ==========================================
-- TABLA: workout_entries
-- Almacena los ejercicios individuales de cada entrenamiento
-- ==========================================
CREATE TABLE IF NOT EXISTS workout_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INT NOT NULL,
  reps_per_set TEXT, -- Formato: "10,10,8" (reps de cada serie)
  weight_per_set TEXT, -- Formato: "50,50,52.5" (peso de cada serie)
  unit TEXT NOT NULL DEFAULT 'kg', -- 'kg' o 'lb'
  rpe INT, -- Rate of Perceived Exertion (1-10)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para workout_entries
CREATE INDEX IF NOT EXISTS idx_workout_entries_workout_id ON workout_entries(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_exercise_id ON workout_entries(exercise_id);

-- ==========================================
-- TABLA: gym_checkins
-- Almacena los check-ins al gimnasio
-- ==========================================
CREATE TABLE IF NOT EXISTS gym_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'WENT' o 'SKIPPED'
  linked_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- Un check-in por día
);

-- Índices para gym_checkins
CREATE INDEX IF NOT EXISTS idx_gym_checkins_user_id ON gym_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_date ON gym_checkins(date DESC);

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

-- Ver estructura de la tabla workouts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workouts'
ORDER BY ordinal_position;

-- Ver estructura de la tabla workout_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workout_entries'
ORDER BY ordinal_position;

-- Ver estructura de la tabla gym_checkins
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gym_checkins'
ORDER BY ordinal_position;

-- Contar registros en cada tabla
SELECT
  'workouts' as table_name,
  COUNT(*) as total_records
FROM workouts
UNION ALL
SELECT
  'workout_entries',
  COUNT(*)
FROM workout_entries
UNION ALL
SELECT
  'gym_checkins',
  COUNT(*)
FROM gym_checkins;
