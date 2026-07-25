-- Actualización del schema de Rutinas
-- Para permitir rutinas flexibles (no solo 5 días de la semana)

-- ==========================================
-- PASO 1: Actualizar tabla routine_templates
-- ==========================================

-- Eliminar la restricción UNIQUE de day_of_week para permitir múltiples rutinas
ALTER TABLE routine_templates DROP CONSTRAINT IF EXISTS routine_templates_user_id_day_of_week_key;

-- Hacer day_of_week opcional (para rutinas personalizadas sin día asignado)
ALTER TABLE routine_templates ALTER COLUMN day_of_week DROP NOT NULL;

-- Agregar campo is_active para marcar rutinas activas
ALTER TABLE routine_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Agregar campo description para descripción de la rutina
ALTER TABLE routine_templates ADD COLUMN IF NOT EXISTS description TEXT;

-- ==========================================
-- PASO 2: Actualizar el trigger de creación automática
-- ==========================================

-- Eliminar el trigger viejo que creaba automáticamente las 5 plantillas
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP FUNCTION IF EXISTS create_default_templates();

-- Crear nueva función que NO crea plantillas automáticamente
-- (el usuario las creará manualmente)
CREATE OR REPLACE FUNCTION handle_new_user_templates()
RETURNS TRIGGER AS $$
BEGIN
  -- Ya no creamos plantillas por defecto
  -- El usuario creará sus propias rutinas
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PASO 3: Agregar índices adicionales
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_routine_templates_is_active ON routine_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_exercises_order ON template_exercises(template_id, order_index);

-- ==========================================
-- PASO 4: Crear vista para rutinas con ejercicios
-- ==========================================

CREATE OR REPLACE VIEW routine_templates_with_exercises AS
SELECT
  rt.id,
  rt.user_id,
  rt.day_of_week,
  rt.template_name,
  rt.workout_type,
  rt.default_visibility,
  rt.is_active,
  rt.description,
  rt.created_at,
  rt.updated_at,
  COUNT(te.id) as exercise_count
FROM routine_templates rt
LEFT JOIN template_exercises te ON rt.id = te.template_id
GROUP BY rt.id, rt.user_id, rt.day_of_week, rt.template_name, rt.workout_type,
         rt.default_visibility, rt.is_active, rt.description, rt.created_at, rt.updated_at
ORDER BY rt.created_at DESC;

-- ==========================================
-- PASO 5: Funciones útiles
-- ==========================================

-- Función para duplicar una rutina
CREATE OR REPLACE FUNCTION duplicate_routine_template(
  p_template_id UUID,
  p_new_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_new_template_id UUID;
  v_user_id UUID;
BEGIN
  -- Obtener user_id de la plantilla original
  SELECT user_id INTO v_user_id
  FROM routine_templates
  WHERE id = p_template_id;

  -- Crear nueva plantilla
  INSERT INTO routine_templates (
    user_id,
    template_name,
    workout_type,
    default_visibility,
    is_active,
    description
  )
  SELECT
    user_id,
    p_new_name,
    workout_type,
    default_visibility,
    is_active,
    description
  FROM routine_templates
  WHERE id = p_template_id
  RETURNING id INTO v_new_template_id;

  -- Copiar ejercicios
  INSERT INTO template_exercises (
    template_id,
    exercise_id,
    exercise_name,
    order_index,
    default_sets,
    default_reps_per_set,
    default_weight_per_set,
    unit,
    default_rpe,
    notes
  )
  SELECT
    v_new_template_id,
    exercise_id,
    exercise_name,
    order_index,
    default_sets,
    default_reps_per_set,
    default_weight_per_set,
    unit,
    default_rpe,
    notes
  FROM template_exercises
  WHERE template_id = p_template_id;

  RETURN v_new_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PASO 6: Limpiar plantillas antiguas (OPCIONAL)
-- ==========================================

-- Si quieres eliminar las plantillas vacías creadas automáticamente antes:
-- DESCOMENTA esta línea solo si sabes lo que haces:

/*
DELETE FROM routine_templates
WHERE template_name IN (
  'Rutina del Lunes',
  'Rutina del Martes',
  'Rutina del Miércoles',
  'Rutina del Jueves',
  'Rutina del Viernes'
)
AND NOT EXISTS (
  SELECT 1 FROM template_exercises
  WHERE template_id = routine_templates.id
);
*/

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Ver todas las rutinas
SELECT * FROM routine_templates_with_exercises;

-- Verificar políticas
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'routine_templates';
