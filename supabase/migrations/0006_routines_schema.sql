-- ==========================================
-- SETUP DE RUTINAS - PASO A PASO
-- ==========================================
-- Ejecuta este script completo en el SQL Editor de Supabase
-- Si algo falla, verás el error exacto

-- ==========================================
-- PASO 1: Eliminar tablas antiguas
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 1: Eliminando tablas antiguas...';
END $$;

DROP TABLE IF EXISTS template_exercises CASCADE;
DROP TABLE IF EXISTS routine_templates CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Tablas antiguas eliminadas';
END $$;

-- ==========================================
-- PASO 2: Crear tabla ROUTINES
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 2: Creando tabla routines...';
END $$;

CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  routine_name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT NOT NULL DEFAULT 'Fuerza',
  total_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla routines creada';
END $$;

-- ==========================================
-- PASO 3: Crear tabla ROUTINE_DAYS
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 3: Creando tabla routine_days...';
END $$;

CREATE TABLE IF NOT EXISTS routine_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_routine FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
  CONSTRAINT unique_day_per_routine UNIQUE(routine_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_routine_days_routine_id ON routine_days(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_days_day_number ON routine_days(routine_id, day_number);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla routine_days creada';
END $$;

-- ==========================================
-- PASO 4: Crear tabla ROUTINE_EXERCISES
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 4: Creando tabla routine_exercises...';
END $$;

CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_day_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight_kg DECIMAL(5,2),
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_routine_day FOREIGN KEY (routine_day_id) REFERENCES routine_days(id) ON DELETE CASCADE,
  CONSTRAINT fk_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
  CONSTRAINT unique_order_per_day UNIQUE(routine_day_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_day_id ON routine_exercises(routine_day_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_order ON routine_exercises(routine_day_id, order_index);

DO $$
BEGIN
  RAISE NOTICE '✓ Tabla routine_exercises creada';
END $$;

-- ==========================================
-- PASO 5: Habilitar RLS
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 5: Habilitando RLS...';
END $$;

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '✓ RLS habilitado';
END $$;

-- ==========================================
-- PASO 6: Crear políticas RLS para ROUTINES
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 6: Creando políticas para routines...';
END $$;

DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
CREATE POLICY "Users can view their own routines"
  ON routines FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own routines" ON routines;
CREATE POLICY "Users can create their own routines"
  ON routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own routines" ON routines;
CREATE POLICY "Users can update their own routines"
  ON routines FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own routines" ON routines;
CREATE POLICY "Users can delete their own routines"
  ON routines FOR DELETE
  USING (auth.uid() = user_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Políticas de routines creadas';
END $$;

-- ==========================================
-- PASO 7: Crear políticas RLS para ROUTINE_DAYS
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 7: Creando políticas para routine_days...';
END $$;

DROP POLICY IF EXISTS "Users can view routine days of their routines" ON routine_days;
CREATE POLICY "Users can view routine days of their routines"
  ON routine_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create routine days in their routines" ON routine_days;
CREATE POLICY "Users can create routine days in their routines"
  ON routine_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update routine days of their routines" ON routine_days;
CREATE POLICY "Users can update routine days of their routines"
  ON routine_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete routine days of their routines" ON routine_days;
CREATE POLICY "Users can delete routine days of their routines"
  ON routine_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✓ Políticas de routine_days creadas';
END $$;

-- ==========================================
-- PASO 8: Crear políticas RLS para ROUTINE_EXERCISES
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 8: Creando políticas para routine_exercises...';
END $$;

DROP POLICY IF EXISTS "Users can view exercises of their routine days" ON routine_exercises;
CREATE POLICY "Users can view exercises of their routine days"
  ON routine_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routine_days
      JOIN routines ON routines.id = routine_days.routine_id
      WHERE routine_days.id = routine_exercises.routine_day_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create exercises in their routine days" ON routine_exercises;
CREATE POLICY "Users can create exercises in their routine days"
  ON routine_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routine_days
      JOIN routines ON routines.id = routine_days.routine_id
      WHERE routine_days.id = routine_exercises.routine_day_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update exercises in their routine days" ON routine_exercises;
CREATE POLICY "Users can update exercises in their routine days"
  ON routine_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routine_days
      JOIN routines ON routines.id = routine_days.routine_id
      WHERE routine_days.id = routine_exercises.routine_day_id
      AND routines.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete exercises from their routine days" ON routine_exercises;
CREATE POLICY "Users can delete exercises from their routine days"
  ON routine_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routine_days
      JOIN routines ON routines.id = routine_days.routine_id
      WHERE routine_days.id = routine_exercises.routine_day_id
      AND routines.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✓ Políticas de routine_exercises creadas';
END $$;

-- ==========================================
-- PASO 9: Crear triggers para updated_at
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 9: Creando triggers...';
END $$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS routines_updated_at ON routines;
CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS routine_days_updated_at ON routine_days;
CREATE TRIGGER routine_days_updated_at
  BEFORE UPDATE ON routine_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DO $$
BEGIN
  RAISE NOTICE '✓ Triggers creados';
END $$;

-- ==========================================
-- PASO 10: Crear función duplicate_routine
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 10: Creando función duplicate_routine...';
END $$;

CREATE OR REPLACE FUNCTION duplicate_routine(
  p_routine_id UUID,
  p_new_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_new_routine_id UUID;
  v_old_day RECORD;
  v_new_day_id UUID;
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM routines
  WHERE id = p_routine_id;

  INSERT INTO routines (
    user_id,
    routine_name,
    description,
    workout_type,
    total_days,
    is_active
  )
  SELECT
    user_id,
    p_new_name,
    description,
    workout_type,
    total_days,
    is_active
  FROM routines
  WHERE id = p_routine_id
  RETURNING id INTO v_new_routine_id;

  FOR v_old_day IN
    SELECT * FROM routine_days WHERE routine_id = p_routine_id ORDER BY day_number
  LOOP
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

  RETURN v_new_routine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✓ Función duplicate_routine creada';
END $$;

-- ==========================================
-- PASO 11: Crear vista routines_summary
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Paso 11: Creando vista routines_summary...';
END $$;

DROP VIEW IF EXISTS routines_summary;
CREATE OR REPLACE VIEW routines_summary AS
SELECT
  r.id,
  r.user_id,
  r.routine_name,
  r.description,
  r.workout_type,
  r.total_days,
  r.is_active,
  r.created_at,
  r.updated_at,
  COUNT(DISTINCT rd.id) as actual_days,
  COUNT(re.id) as total_exercises
FROM routines r
LEFT JOIN routine_days rd ON rd.routine_id = r.id
LEFT JOIN routine_exercises re ON re.routine_day_id = rd.id
GROUP BY r.id, r.user_id, r.routine_name, r.description, r.workout_type,
         r.total_days, r.is_active, r.created_at, r.updated_at;

DO $$
BEGIN
  RAISE NOTICE '✓ Vista routines_summary creada';
END $$;

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
END $$;

-- Verificar tablas creadas
SELECT
  'routines' as tabla,
  COUNT(*) as filas
FROM routines
UNION ALL
SELECT
  'routine_days' as tabla,
  COUNT(*) as filas
FROM routine_days
UNION ALL
SELECT
  'routine_exercises' as tabla,
  COUNT(*) as filas
FROM routine_exercises;
