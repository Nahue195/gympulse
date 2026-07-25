-- ==========================================
-- AGREGAR COLUMNAS A LA TABLA EXERCISES
-- Para soportar ejercicios personalizados
-- ==========================================

-- 1. Agregar columna is_custom (marca si es ejercicio personalizado)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;

-- 2. Agregar columna category (Fuerza, Cardio, Flexibilidad)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Fuerza';

-- 3. Agregar columna description (notas del ejercicio)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Agregar columna user_id (para ejercicios personalizados)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Agregar columna tracking_type (cómo se mide el ejercicio)
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS tracking_type TEXT DEFAULT 'reps';

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_is_custom ON exercises(is_custom);

-- ==========================================
-- ACTUALIZAR POLÍTICAS RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS si no está habilitado
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Ejercicios públicos visibles para todos" ON exercises;
DROP POLICY IF EXISTS "Usuarios pueden ver sus ejercicios personalizados" ON exercises;
DROP POLICY IF EXISTS "Usuarios pueden crear ejercicios personalizados" ON exercises;
DROP POLICY IF EXISTS "Usuarios pueden editar sus ejercicios" ON exercises;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus ejercicios" ON exercises;
DROP POLICY IF EXISTS "exercises_select_policy" ON exercises;
DROP POLICY IF EXISTS "exercises_insert_policy" ON exercises;

-- Política: Todos pueden ver ejercicios del sistema y sus propios personalizados
CREATE POLICY "exercises_select_policy" ON exercises
  FOR SELECT
  USING (
    is_custom = false
    OR is_custom IS NULL
    OR user_id IS NULL
    OR auth.uid() = user_id
  );

-- Política: Usuarios autenticados pueden crear ejercicios personalizados
CREATE POLICY "exercises_insert_policy" ON exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden editar sus propios ejercicios
CREATE POLICY "Usuarios pueden editar sus ejercicios" ON exercises
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuarios pueden eliminar sus propios ejercicios
CREATE POLICY "Usuarios pueden eliminar sus ejercicios" ON exercises
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- MARCAR EJERCICIOS EXISTENTES COMO NO PERSONALIZADOS
-- ==========================================

-- Todos los ejercicios existentes son del sistema
UPDATE exercises
SET is_custom = false
WHERE is_custom IS NULL;

-- Asignar categoría Cardio
UPDATE exercises
SET category = 'Cardio', tracking_type = 'time'
WHERE muscle_group = 'Cardio';

-- El resto son de fuerza
UPDATE exercises
SET category = 'Fuerza', tracking_type = 'reps'
WHERE category IS NULL OR category = 'Fuerza';

-- ==========================================
-- VERIFICAR CAMBIOS (ejecutar aparte)
-- ==========================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'exercises';
