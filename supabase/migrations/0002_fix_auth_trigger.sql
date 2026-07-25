-- Fix para el registro de usuarios
-- Ejecuta este script en tu SQL Editor de Supabase

-- Primero, elimina la política INSERT restrictiva actual
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Crea una función que se ejecute automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, username, avatar_url, gym_goal, experience_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'gym_goal',
    NEW.raw_user_meta_data->>'experience_level'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Elimina el trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crea el trigger que ejecuta la función cuando se crea un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ahora los usuarios NO necesitan insertar manualmente en users
-- El trigger lo hace automáticamente de forma segura
