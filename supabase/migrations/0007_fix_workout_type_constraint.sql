-- ==========================================
-- ARREGLAR CONSTRAINT DE workout_type
-- ==========================================

-- Primero, ver el constraint actual
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid::regclass::text = 'workouts'
  AND conname LIKE '%workout_type%';

-- Eliminar el constraint viejo si existe
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_workout_type_check;

-- Crear nuevo constraint que permita valores en español
ALTER TABLE workouts
ADD CONSTRAINT workouts_workout_type_check
CHECK (workout_type IN ('Fuerza', 'Cardio', 'Híbrido', 'Movilidad', 'Otro'));

-- Verificar que funcionó
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid::regclass::text = 'workouts'
  AND conname = 'workouts_workout_type_check';
