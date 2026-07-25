-- ==========================================
-- DIAGNÓSTICO DE TABLAS DE ENTRENAMIENTO
-- ==========================================

-- Ver si la tabla workouts existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'workouts'
) as workouts_exists;

-- Ver estructura de la tabla workouts (si existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workouts'
ORDER BY ordinal_position;

-- Ver si la tabla workout_entries existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'workout_entries'
) as workout_entries_exists;

-- Ver estructura de la tabla workout_entries (si existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workout_entries'
ORDER BY ordinal_position;

-- Ver si la tabla gym_checkins existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'gym_checkins'
) as gym_checkins_exists;

-- Ver estructura de la tabla gym_checkins (si existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gym_checkins'
ORDER BY ordinal_position;

-- Listar todas las tablas existentes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
