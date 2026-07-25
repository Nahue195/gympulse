-- =============================================
-- GymPulse Notifications System
-- =============================================
-- Execute this SQL in Supabase SQL Editor

-- Enum for notification types
CREATE TYPE notification_type AS ENUM (
  'NEW_FOLLOWER',
  'POST_LIKE',
  'POST_COMMENT',
  'NEW_MESSAGE'
);

-- Enum for reference types
CREATE TYPE reference_type AS ENUM (
  'post',
  'comment',
  'conversation',
  'follow'
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id UUID,
  reference_type reference_type,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert (for triggers)
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Trigger Functions for Auto-creating Notifications
-- =============================================

-- Function: Create notification on new follow
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if following yourself
  IF NEW.follower_id != NEW.following_id THEN
    INSERT INTO notifications (user_id, type, actor_id, reference_id, reference_type)
    VALUES (
      NEW.following_id,
      'NEW_FOLLOWER',
      NEW.follower_id,
      NEW.id,
      'follow'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification on post like
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify if liking your own post
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO notifications (user_id, type, actor_id, reference_id, reference_type)
    VALUES (
      post_owner_id,
      'POST_LIKE',
      NEW.user_id,
      NEW.post_id,
      'post'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification on post comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify if commenting on your own post
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO notifications (user_id, type, actor_id, reference_id, reference_type)
    VALUES (
      post_owner_id,
      'POST_COMMENT',
      NEW.user_id,
      NEW.id,
      'comment'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification on new message
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  conv_participant_1 UUID;
  conv_participant_2 UUID;
BEGIN
  -- Get conversation participants
  SELECT participant_1, participant_2
  INTO conv_participant_1, conv_participant_2
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Determine the recipient (the other participant)
  IF NEW.sender_id = conv_participant_1 THEN
    recipient_id := conv_participant_2;
  ELSE
    recipient_id := conv_participant_1;
  END IF;

  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, actor_id, reference_id, reference_type)
  VALUES (
    recipient_id,
    'NEW_MESSAGE',
    NEW.sender_id,
    NEW.conversation_id,
    'conversation'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Create Triggers
-- =============================================

-- Trigger for follows
DROP TRIGGER IF EXISTS on_follow_create_notification ON follows;
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();

-- Trigger for post likes
DROP TRIGGER IF EXISTS on_like_create_notification ON post_likes;
CREATE TRIGGER on_like_create_notification
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Trigger for post comments
DROP TRIGGER IF EXISTS on_comment_create_notification ON post_comments;
CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- Trigger for messages
DROP TRIGGER IF EXISTS on_message_create_notification ON messages;
CREATE TRIGGER on_message_create_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- =============================================
-- Enable Realtime for notifications
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- Cleanup old notifications (optional - run periodically)
-- =============================================
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';
