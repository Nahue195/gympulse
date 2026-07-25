-- Community Feature Schema
-- Ejecuta este script en tu SQL Editor de Supabase

-- ==========================================
-- TABLAS
-- ==========================================

-- Posts table (publicaciones de la comunidad)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_text TEXT,
  image_urls TEXT[], -- Array de URLs de imágenes (max 3)
  post_type TEXT NOT NULL CHECK (post_type IN ('TEXT', 'IMAGE', 'WORKOUT_SHARE')) DEFAULT 'TEXT',
  shared_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostLikes table (likes en posts)
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Un usuario solo puede dar like una vez por post
);

-- PostComments table (comentarios en posts)
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES para mejor performance
-- ==========================================

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);

-- ==========================================
-- TRIGGERS para actualizar counters
-- ==========================================

-- Trigger para actualizar likes_count cuando se agrega/elimina un like
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Trigger para actualizar comments_count cuando se agrega/elimina un comentario
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Trigger para actualizar updated_at en posts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver posts públicos
CREATE POLICY "Anyone can view public posts"
  ON posts FOR SELECT
  USING (visibility = 'PUBLIC');

-- Los usuarios pueden crear sus propios posts
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propios posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propios posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (user_id = auth.uid());

-- PostLikes table
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los likes
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

-- Los usuarios pueden dar like
CREATE POLICY "Users can create likes"
  ON post_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden quitar su propio like
CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  USING (user_id = auth.uid());

-- PostComments table
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver comentarios
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  USING (true);

-- Los usuarios pueden crear comentarios
CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propios comentarios
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propios comentarios
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- STORAGE BUCKET para imágenes de posts
-- ==========================================

-- Crear bucket para imágenes de posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para subir imágenes (solo usuarios autenticados)
CREATE POLICY "Users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images' AND
    auth.role() = 'authenticated'
  );

-- Política para ver imágenes (todos)
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Política para eliminar sus propias imágenes
CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- VISTAS útiles
-- ==========================================

-- Vista para posts con información del usuario
CREATE OR REPLACE VIEW posts_with_user AS
SELECT
  p.id,
  p.user_id,
  p.content_text,
  p.image_urls,
  p.post_type,
  p.shared_workout_id,
  p.visibility,
  p.likes_count,
  p.comments_count,
  p.created_at,
  p.updated_at,
  u.display_name,
  u.username,
  u.avatar_url,
  -- Incluir workout info si está compartido
  w.routine_name as workout_routine_name,
  w.workout_type,
  w.duration_minutes
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN workouts w ON p.shared_workout_id = w.id
ORDER BY p.created_at DESC;

-- ==========================================
-- FUNCIONES de utilidad
-- ==========================================

-- Función para verificar si un usuario dio like a un post
CREATE OR REPLACE FUNCTION user_has_liked_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- DATOS DE PRUEBA (opcional)
-- ==========================================

-- Descomentar para agregar posts de ejemplo
/*
-- Insertar un post de ejemplo (reemplaza el user_id con uno válido)
INSERT INTO posts (user_id, content_text, post_type)
VALUES (
  (SELECT id FROM users LIMIT 1),
  '¡Primer día de entrenamiento en GymPulse! 💪 Empezando con una rutina de fuerza.',
  'TEXT'
);
*/

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Verificar que las tablas se crearon correctamente
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('posts', 'post_likes', 'post_comments')
ORDER BY table_name;

-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('posts', 'post_likes', 'post_comments');

-- Verificar políticas RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('posts', 'post_likes', 'post_comments')
ORDER BY tablename, policyname;
