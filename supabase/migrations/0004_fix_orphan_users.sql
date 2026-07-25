-- Script para arreglar usuarios huérfanos (auth.users sin perfil en users)
-- Ejecuta este script en tu SQL Editor de Supabase

-- ==========================================
-- PASO 1: Verificar usuarios huérfanos
-- ==========================================

-- Ver usuarios que están en auth.users pero NO en users
SELECT
  au.id,
  au.email,
  au.created_at as registered_at,
  au.email_confirmed_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Si ves resultados aquí, tienes usuarios huérfanos

-- ==========================================
-- PASO 2: OPCIÓN A - Crear perfiles para usuarios existentes
-- ==========================================

-- Esta opción crea perfiles para todos los usuarios huérfanos
-- DESCOMENTA las siguientes líneas si quieres ARREGLAR los usuarios existentes:

/*
INSERT INTO users (id, display_name, username, avatar_url, gym_goal, experience_level)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1) || '_' || substr(au.id::text, 1, 6)),
  au.raw_user_meta_data->>'avatar_url',
  au.raw_user_meta_data->>'gym_goal',
  au.raw_user_meta_data->>'experience_level'
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Crear plantillas de rutinas para los usuarios arreglados
INSERT INTO routine_templates (user_id, day_of_week, template_name, workout_type)
SELECT
  au.id,
  day,
  CASE
    WHEN day = 'MON' THEN 'Rutina del Lunes'
    WHEN day = 'TUE' THEN 'Rutina del Martes'
    WHEN day = 'WED' THEN 'Rutina del Miércoles'
    WHEN day = 'THU' THEN 'Rutina del Jueves'
    WHEN day = 'FRI' THEN 'Rutina del Viernes'
  END,
  'custom'
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
CROSS JOIN (VALUES ('MON'), ('TUE'), ('WED'), ('THU'), ('FRI')) AS days(day)
WHERE u.id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM routine_templates rt
  WHERE rt.user_id = au.id AND rt.day_of_week = day
);
*/

-- ==========================================
-- PASO 3: OPCIÓN B - Eliminar usuarios huérfanos
-- ==========================================

-- Esta opción elimina los usuarios que no tienen perfil
-- DESCOMENTA las siguientes líneas si quieres ELIMINAR los usuarios huérfanos:

/*
DELETE FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN users u ON au.id = u.id
  WHERE u.id IS NULL
);
*/

-- ==========================================
-- PASO 4: Verificar que no quedan huérfanos
-- ==========================================

-- Ejecuta esto de nuevo para verificar
SELECT
  au.id,
  au.email,
  u.username
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Si no hay resultados, todo está bien!

-- ==========================================
-- PASO 5: Ver todos los usuarios correctos
-- ==========================================

-- Ver usuarios con sus perfiles correctamente vinculados
SELECT
  au.email,
  u.display_name,
  u.username,
  au.created_at
FROM auth.users au
INNER JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;
