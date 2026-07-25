-- =============================================
-- Fix: Triggers para actualizar followers_count y following_count
-- =============================================
-- Ejecuta este SQL en Supabase SQL Editor

-- Función para actualizar contadores de followers/following
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar following_count del seguidor
    UPDATE users
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE id = NEW.follower_id;

    -- Incrementar followers_count del seguido
    UPDATE users
    SET followers_count = COALESCE(followers_count, 0) + 1
    WHERE id = NEW.following_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar following_count del seguidor
    UPDATE users
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE id = OLD.follower_id;

    -- Decrementar followers_count del seguido
    UPDATE users
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE id = OLD.following_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;

-- Crear el trigger
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- =============================================
-- Sincronizar contadores existentes (por si hay datos desincronizados)
-- =============================================

-- Actualizar followers_count para todos los usuarios
UPDATE users u
SET followers_count = (
  SELECT COUNT(*)
  FROM follows f
  WHERE f.following_id = u.id
);

-- Actualizar following_count para todos los usuarios
UPDATE users u
SET following_count = (
  SELECT COUNT(*)
  FROM follows f
  WHERE f.follower_id = u.id
);

-- =============================================
-- Verificar que los triggers se crearon correctamente
-- =============================================
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'follows';

-- Verificar contadores actuales
SELECT id, display_name, username, followers_count, following_count
FROM users
ORDER BY followers_count DESC
LIMIT 10;
