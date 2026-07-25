-- ==========================================
-- RUTINAS PUBLICAS - Schema Update
-- ==========================================
-- Este script agrega soporte para rutinas publicas que pueden ser
-- exploradas y clonadas por otros usuarios

-- ==========================================
-- PASO 1: Agregar columnas para visibilidad y clonacion
-- ==========================================

-- Agregar columna de visibilidad (PRIVATE o PUBLIC)
ALTER TABLE routines ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'PRIVATE';

-- Agregar columna para contar clones
ALTER TABLE routines ADD COLUMN IF NOT EXISTS clone_count INTEGER NOT NULL DEFAULT 0;

-- Agregar columna para indicar si es una copia de otra rutina
ALTER TABLE routines ADD COLUMN IF NOT EXISTS cloned_from UUID REFERENCES routines(id) ON DELETE SET NULL;

-- Indice para buscar rutinas publicas
CREATE INDEX IF NOT EXISTS idx_routines_visibility ON routines(visibility);
CREATE INDEX IF NOT EXISTS idx_routines_clone_count ON routines(clone_count);

-- ==========================================
-- PASO 2: Actualizar politicas RLS para rutinas publicas
-- ==========================================

-- Eliminar politicas anteriores de SELECT
DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
DROP POLICY IF EXISTS "Users can view own and public routines" ON routines;

-- Nueva politica: usuarios pueden ver sus propias rutinas Y las publicas
CREATE POLICY "Users can view own and public routines"
  ON routines FOR SELECT
  USING (
    auth.uid() = user_id
    OR visibility = 'PUBLIC'
  );

-- ==========================================
-- PASO 3: Actualizar politicas para routine_days y routine_exercises
-- ==========================================

-- ROUTINE_DAYS: permitir ver dias de rutinas publicas
DROP POLICY IF EXISTS "Users can view routine days of their routines" ON routine_days;
DROP POLICY IF EXISTS "Users can view routine days of own and public routines" ON routine_days;

CREATE POLICY "Users can view routine days of own and public routines"
  ON routine_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND (routines.user_id = auth.uid() OR routines.visibility = 'PUBLIC')
    )
  );

-- ROUTINE_EXERCISES: permitir ver ejercicios de rutinas publicas
DROP POLICY IF EXISTS "Users can view exercises of their routine days" ON routine_exercises;
DROP POLICY IF EXISTS "Users can view exercises of own and public routines" ON routine_exercises;

CREATE POLICY "Users can view exercises of own and public routines"
  ON routine_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routine_days
      JOIN routines ON routines.id = routine_days.routine_id
      WHERE routine_days.id = routine_exercises.routine_day_id
      AND (routines.user_id = auth.uid() OR routines.visibility = 'PUBLIC')
    )
  );

-- ==========================================
-- PASO 4: Funcion para clonar rutina publica
-- ==========================================

CREATE OR REPLACE FUNCTION clone_public_routine(
  p_routine_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_new_routine_id UUID;
  v_old_day RECORD;
  v_new_day_id UUID;
  v_original_visibility TEXT;
BEGIN
  -- Verificar que la rutina existe y es publica
  SELECT visibility INTO v_original_visibility
  FROM routines
  WHERE id = p_routine_id;

  IF v_original_visibility IS NULL THEN
    RAISE EXCEPTION 'Rutina no encontrada';
  END IF;

  IF v_original_visibility != 'PUBLIC' THEN
    RAISE EXCEPTION 'Solo se pueden clonar rutinas publicas';
  END IF;

  -- Crear nueva rutina como copia
  INSERT INTO routines (
    user_id,
    routine_name,
    description,
    workout_type,
    total_days,
    is_active,
    visibility,
    cloned_from
  )
  SELECT
    p_user_id,
    routine_name || ' (copia)',
    description,
    workout_type,
    total_days,
    true,
    'PRIVATE',  -- Las copias son privadas por defecto
    p_routine_id
  FROM routines
  WHERE id = p_routine_id
  RETURNING id INTO v_new_routine_id;

  -- Copiar dias y ejercicios
  FOR v_old_day IN
    SELECT * FROM routine_days WHERE routine_id = p_routine_id ORDER BY day_number
  LOOP
    -- Crear nuevo dia
    INSERT INTO routine_days (
      routine_id,
      day_number,
      day_name,
      notes
    )
    VALUES (
      v_new_routine_id,
      v_old_day.day_number,
      v_old_day.day_name,
      v_old_day.notes
    )
    RETURNING id INTO v_new_day_id;

    -- Copiar ejercicios del dia
    INSERT INTO routine_exercises (
      routine_day_id,
      exercise_id,
      exercise_name,
      order_index,
      sets,
      reps,
      weight_kg,
      rest_seconds,
      notes
    )
    SELECT
      v_new_day_id,
      exercise_id,
      exercise_name,
      order_index,
      sets,
      reps,
      weight_kg,
      rest_seconds,
      notes
    FROM routine_exercises
    WHERE routine_day_id = v_old_day.id
    ORDER BY order_index;
  END LOOP;

  -- Incrementar contador de clones en la rutina original
  UPDATE routines
  SET clone_count = clone_count + 1
  WHERE id = p_routine_id;

  RETURN v_new_routine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PASO 5: Vista para rutinas publicas con info del autor
-- ==========================================

DROP VIEW IF EXISTS public_routines_view;
CREATE OR REPLACE VIEW public_routines_view AS
SELECT
  r.id,
  r.user_id,
  r.routine_name,
  r.description,
  r.workout_type,
  r.total_days,
  r.is_active,
  r.visibility,
  r.clone_count,
  r.created_at,
  r.updated_at,
  u.display_name as author_name,
  u.username as author_username,
  u.avatar_url as author_avatar,
  COUNT(DISTINCT rd.id) as actual_days,
  COUNT(re.id) as total_exercises
FROM routines r
JOIN users u ON u.id = r.user_id
LEFT JOIN routine_days rd ON rd.routine_id = r.id
LEFT JOIN routine_exercises re ON re.routine_day_id = rd.id
WHERE r.visibility = 'PUBLIC' AND r.is_active = true
GROUP BY r.id, r.user_id, r.routine_name, r.description, r.workout_type,
         r.total_days, r.is_active, r.visibility, r.clone_count, r.created_at,
         r.updated_at, u.display_name, u.username, u.avatar_url
ORDER BY r.clone_count DESC, r.created_at DESC;

-- ==========================================
-- VERIFICACION
-- ==========================================

-- Ver columnas de la tabla routines
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'routines'
ORDER BY ordinal_position;

-- Ver politicas actualizadas
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('routines', 'routine_days', 'routine_exercises')
ORDER BY tablename, policyname;
