-- SOLUCIÓN COMPLETA para el problema de RLS
-- Ejecuta TODO este script en tu SQL Editor de Supabase

-- ==========================================
-- PASO 1: Limpiar políticas existentes
-- ==========================================

-- Eliminar todas las políticas de la tabla users
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- ==========================================
-- PASO 2: Crear nuevas políticas permisivas
-- ==========================================

-- Permitir que TODOS puedan leer perfiles (necesario para el feed de comunidad)
CREATE POLICY "Anyone can view user profiles"
  ON users FOR SELECT
  USING (true);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Permitir que los usuarios eliminen su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- IMPORTANTE: NO crear política INSERT manual
-- El trigger manejará las inserciones

-- ==========================================
-- PASO 3: Eliminar trigger existente
-- ==========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_default_templates();

-- ==========================================
-- PASO 4: Crear función de registro mejorada
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insertar el perfil del usuario
  INSERT INTO public.users (
    id,
    display_name,
    username,
    avatar_url,
    gym_goal,
    experience_level
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'gym_goal',
    NEW.raw_user_meta_data->>'experience_level'
  );

  -- Crear las 5 plantillas de rutinas
  INSERT INTO public.routine_templates (user_id, day_of_week, template_name, workout_type)
  VALUES
    (NEW.id, 'MON', 'Rutina del Lunes', 'custom'),
    (NEW.id, 'TUE', 'Rutina del Martes', 'custom'),
    (NEW.id, 'WED', 'Rutina del Miércoles', 'custom'),
    (NEW.id, 'THU', 'Rutina del Jueves', 'custom'),
    (NEW.id, 'FRI', 'Rutina del Viernes', 'custom');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si hay un error, lo registramos pero no bloqueamos el registro
  RAISE WARNING 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ==========================================
-- PASO 5: Crear el trigger
-- ==========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- PASO 6: Limpiar usuarios huérfanos
-- ==========================================

-- Eliminar usuarios de auth.users que no tienen perfil
-- SOLO si quieres limpiar los registros anteriores que fallaron
-- (COMENTADO por seguridad, descomenta solo si sabes lo que haces)

-- DELETE FROM auth.users
-- WHERE id NOT IN (SELECT id FROM users);

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Verifica que el trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verifica las políticas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'users';
