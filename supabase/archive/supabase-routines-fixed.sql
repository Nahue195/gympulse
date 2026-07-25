-- ==========================================
-- NUEVO SCHEMA DE RUTINAS - VERSIÓN CORREGIDA
-- ==========================================
-- Una RUTINA es un programa completo (ej: "Push Pull Legs", "Full Body")
-- Cada rutina tiene múltiples DÍAS (Día 1, Día 2, Día 3, etc.)
-- Cada día tiene múltiples EJERCICIOS con sets, reps y peso

-- ==========================================
-- PASO 1: Eliminar tablas antiguas si existen
-- ==========================================

-- Eliminar la tabla antigua routine_templates y relacionadas
DROP TABLE IF EXISTS template_exercises CASCADE;
DROP TABLE IF EXISTS routine_templates CASCADE;

-- ==========================================
-- PASO 2: Crear tabla de RUTINAS (programas completos)
-- ==========================================

CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  routine_name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT NOT NULL DEFAULT 'Fuerza',
  total_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_is_active ON routines(is_active);

-- ==========================================
-- PASO 3: Crear tabla de DÍAS de rutina
-- ==========================================

CREATE TABLE routine_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  day_name TEXT NOT NULL, -- "Push Day", "Pull Day", "Leg Day", etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: un número de día único por rutina
  UNIQUE(routine_id, day_number)
);

-- Índices
CREATE INDEX idx_routine_days_routine_id ON routine_days(routine_id);
CREATE INDEX idx_routine_days_day_number ON routine_days(routine_id, day_number);

-- ==========================================
-- PASO 4: Crear tabla de EJERCICIOS por día
-- ==========================================

CREATE TABLE routine_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_day_id UUID REFERENCES routine_days(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight_kg DECIMAL(5,2), -- puede ser NULL para ejercicios sin peso
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: orden único por día
  UNIQUE(routine_day_id, order_index)
);

-- Índices
CREATE INDEX idx_routine_exercises_day_id ON routine_exercises(routine_day_id);
CREATE INDEX idx_routine_exercises_order ON routine_exercises(routine_day_id, order_index);

-- ==========================================
-- PASO 5: Políticas RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Políticas para ROUTINES
CREATE POLICY "Users can view their own routines"
  ON routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routines"
  ON routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines"
  ON routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines"
  ON routines FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para ROUTINE_DAYS
CREATE POLICY "Users can view routine days of their routines"
  ON routine_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create routine days in their routines"
  ON routine_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update routine days of their routines"
  ON routine_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete routine days of their routines"
  ON routine_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_days.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Políticas para ROUTINE_EXERCISES
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

-- ==========================================
-- PASO 6: Vistas útiles
-- ==========================================

-- Vista: Rutinas con conteo de días y ejercicios
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

-- ==========================================
-- PASO 7: Funciones útiles
-- ==========================================

-- Función para duplicar una rutina completa
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
  -- Obtener user_id de la rutina original
  SELECT user_id INTO v_user_id
  FROM routines
  WHERE id = p_routine_id;

  -- Crear nueva rutina
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

  -- Copiar días y ejercicios
  FOR v_old_day IN
    SELECT * FROM routine_days WHERE routine_id = p_routine_id ORDER BY day_number
  LOOP
    -- Crear nuevo día
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

    -- Copiar ejercicios del día
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

-- ==========================================
-- PASO 8: Triggers para actualizar updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER routine_days_updated_at
  BEFORE UPDATE ON routine_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- PASO 9: Datos de ejemplo (opcional)
-- ==========================================

-- Puedes descomentar esto para insertar rutinas de ejemplo
/*
-- Ejemplo: Full Body (3 días)
DO $$
DECLARE
  v_routine_id UUID;
  v_day1_id UUID;
  v_day2_id UUID;
  v_day3_id UUID;
  v_user_id UUID;
BEGIN
  -- Obtener el primer usuario (ajusta según tu caso)
  SELECT id INTO v_user_id FROM users LIMIT 1;

  -- Crear rutina Full Body
  INSERT INTO routines (user_id, routine_name, description, workout_type, total_days)
  VALUES (v_user_id, 'Full Body 3x', 'Rutina de cuerpo completo 3 veces por semana', 'Fuerza', 3)
  RETURNING id INTO v_routine_id;

  -- Día 1
  INSERT INTO routine_days (routine_id, day_number, day_name)
  VALUES (v_routine_id, 1, 'Full Body A')
  RETURNING id INTO v_day1_id;

  -- Día 2
  INSERT INTO routine_days (routine_id, day_number, day_name)
  VALUES (v_routine_id, 2, 'Full Body B')
  RETURNING id INTO v_day2_id;

  -- Día 3
  INSERT INTO routine_days (routine_id, day_number, day_name)
  VALUES (v_routine_id, 3, 'Full Body C')
  RETURNING id INTO v_day3_id;
END $$;
*/

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Ver todas las tablas creadas
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('routines', 'routine_days', 'routine_exercises')
ORDER BY tablename;

-- Ver políticas RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('routines', 'routine_days', 'routine_exercises')
ORDER BY tablename, policyname;
