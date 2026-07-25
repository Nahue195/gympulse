-- ==========================================
-- SCHEMA DE MENSAJES PARA GYMPULSE
-- Ejecuta este script en tu SQL Editor de Supabase
-- ==========================================

-- ==========================================
-- TABLAS
-- ==========================================

-- Conversations table (conversaciones entre dos usuarios)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Asegurar que participant_1 < participant_2 para evitar duplicados
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2),
  CONSTRAINT different_participants CHECK (participant_1 <> participant_2),
  CONSTRAINT ordered_participants CHECK (participant_1 < participant_2)
);

-- Messages table (mensajes dentro de una conversacion)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDICES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver conversaciones donde son participantes
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    participant_1 = auth.uid() OR participant_2 = auth.uid()
  );

-- Los usuarios pueden crear conversaciones
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    participant_1 = auth.uid() OR participant_2 = auth.uid()
  );

-- Los usuarios pueden actualizar conversaciones donde son participantes
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (
    participant_1 = auth.uid() OR participant_2 = auth.uid()
  );

-- Habilitar RLS en messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- Los usuarios pueden enviar mensajes a sus conversaciones
DROP POLICY IF EXISTS "Users can send messages to own conversations" ON messages;
CREATE POLICY "Users can send messages to own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- Los usuarios pueden marcar mensajes como leidos (solo los que reciben)
DROP POLICY IF EXISTS "Users can update messages read status" ON messages;
CREATE POLICY "Users can update messages read status"
  ON messages FOR UPDATE
  USING (
    -- El usuario puede actualizar mensajes donde es el receptor (no el sender)
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger para actualizar last_message_at en la conversacion
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ==========================================
-- FUNCION PARA CREAR/OBTENER CONVERSACION
-- ==========================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user_1 UUID, p_user_2 UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
BEGIN
  -- Ordenar los participantes para mantener consistencia
  IF p_user_1 < p_user_2 THEN
    v_participant_1 := p_user_1;
    v_participant_2 := p_user_2;
  ELSE
    v_participant_1 := p_user_2;
    v_participant_2 := p_user_1;
  END IF;

  -- Buscar conversacion existente
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = v_participant_1 AND participant_2 = v_participant_2;

  -- Si no existe, crear una nueva
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (v_participant_1, v_participant_2)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- HABILITAR REALTIME
-- ==========================================

-- IMPORTANTE: Esto habilita las suscripciones en tiempo real para mensajes
-- Ejecuta esto en Supabase o habilita Realtime manualmente en el dashboard

-- Para habilitar Realtime en la tabla messages:
-- 1. Ve a Database > Replication en el dashboard de Supabase
-- 2. Habilita "Realtime" para la tabla "messages"
-- 3. Asegurate de que "Realtime" esta habilitado para INSERT

-- Alternativamente, puedes ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ==========================================
-- VERIFICACION
-- ==========================================

-- Verificar tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');

-- Verificar politicas RLS
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- Verificar que Realtime esta habilitado
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
