-- GymPulse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  gym_goal TEXT CHECK (gym_goal IN ('strength', 'hypertrophy', 'weight_loss', 'endurance', 'general_fitness')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises table (catalog of exercises)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body')),
  equipment TEXT NOT NULL CHECK (equipment IN ('barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'other')),
  default_unit TEXT DEFAULT 'kg' CHECK (default_unit IN ('kg', 'lb')),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts table (training sessions)
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  routine_name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('push', 'pull', 'legs', 'full_body', 'upper', 'lower', 'cardio', 'custom')),
  duration_minutes INTEGER,
  notes TEXT,
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout entries table (exercises within a workout)
CREATE TABLE workout_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps_per_set TEXT,
  weight_per_set TEXT,
  unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'lb')),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Measures table (body measurements)
CREATE TABLE measures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2) NOT NULL,
  neck_cm NUMERIC(5,2),
  chest_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hip_cm NUMERIC(5,2),
  arm_cm NUMERIC(5,2),
  thigh_cm NUMERIC(5,2),
  body_fat_pct NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gym checkins table (daily attendance tracking)
CREATE TABLE gym_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('WENT', 'SKIPPED')),
  linked_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Routine templates table (5 weekday templates)
CREATE TABLE routine_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('MON', 'TUE', 'WED', 'THU', 'FRI')),
  template_name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('push', 'pull', 'legs', 'full_body', 'upper', 'lower', 'cardio', 'custom')),
  default_visibility TEXT DEFAULT 'PUBLIC' CHECK (default_visibility IN ('PUBLIC', 'PRIVATE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Template exercises table (exercises within a routine template)
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES routine_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  default_sets INTEGER NOT NULL DEFAULT 3,
  default_reps_per_set TEXT,
  default_weight_per_set TEXT,
  unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'lb')),
  default_rpe INTEGER CHECK (default_rpe >= 1 AND default_rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date DESC);
CREATE INDEX idx_workouts_visibility ON workouts(visibility);
CREATE INDEX idx_workout_entries_workout_id ON workout_entries(workout_id);
CREATE INDEX idx_measures_user_id ON measures(user_id);
CREATE INDEX idx_measures_date ON measures(date DESC);
CREATE INDEX idx_gym_checkins_user_id ON gym_checkins(user_id);
CREATE INDEX idx_gym_checkins_date ON gym_checkins(date DESC);
CREATE INDEX idx_routine_templates_user_id ON routine_templates(user_id);
CREATE INDEX idx_template_exercises_template_id ON template_exercises(template_id);

-- Row Level Security (RLS) Policies

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Exercises table (public read, no write for users)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public exercises"
  ON exercises FOR SELECT
  USING (is_public = true);

-- Workouts table
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public workouts"
  ON workouts FOR SELECT
  USING (visibility = 'PUBLIC' OR user_id = auth.uid());

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (user_id = auth.uid());

-- Workout entries table
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries of accessible workouts"
  ON workout_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_entries.workout_id
      AND (workouts.visibility = 'PUBLIC' OR workouts.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert entries to own workouts"
  ON workout_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_entries.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries of own workouts"
  ON workout_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_entries.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries of own workouts"
  ON workout_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_entries.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Measures table
ALTER TABLE measures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measures"
  ON measures FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own measures"
  ON measures FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own measures"
  ON measures FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own measures"
  ON measures FOR DELETE
  USING (user_id = auth.uid());

-- Gym checkins table
ALTER TABLE gym_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all checkins"
  ON gym_checkins FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own checkins"
  ON gym_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own checkins"
  ON gym_checkins FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own checkins"
  ON gym_checkins FOR DELETE
  USING (user_id = auth.uid());

-- Routine templates table
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON routine_templates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own templates"
  ON routine_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON routine_templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON routine_templates FOR DELETE
  USING (user_id = auth.uid());

-- Template exercises table
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises of own templates"
  ON template_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routine_templates
      WHERE routine_templates.id = template_exercises.template_id
      AND routine_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exercises to own templates"
  ON template_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routine_templates
      WHERE routine_templates.id = template_exercises.template_id
      AND routine_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises of own templates"
  ON template_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routine_templates
      WHERE routine_templates.id = template_exercises.template_id
      AND routine_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises of own templates"
  ON template_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routine_templates
      WHERE routine_templates.id = template_exercises.template_id
      AND routine_templates.user_id = auth.uid()
    )
  );

-- Function to automatically create routine templates for new users
CREATE OR REPLACE FUNCTION create_default_templates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO routine_templates (user_id, day_of_week, template_name, workout_type)
  VALUES
    (NEW.id, 'MON', 'Rutina del Lunes', 'custom'),
    (NEW.id, 'TUE', 'Rutina del Martes', 'custom'),
    (NEW.id, 'WED', 'Rutina del Miércoles', 'custom'),
    (NEW.id, 'THU', 'Rutina del Jueves', 'custom'),
    (NEW.id, 'FRI', 'Rutina del Viernes', 'custom');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create templates when user is created
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_templates();

-- Sample exercises seed data
INSERT INTO exercises (name, muscle_group, equipment, default_unit) VALUES
  -- Chest
  ('Press de Banca', 'chest', 'barbell', 'kg'),
  ('Press de Banca con Mancuernas', 'chest', 'dumbbell', 'kg'),
  ('Fondos en Paralelas', 'chest', 'bodyweight', 'kg'),
  ('Aperturas con Mancuernas', 'chest', 'dumbbell', 'kg'),

  -- Back
  ('Peso Muerto', 'back', 'barbell', 'kg'),
  ('Dominadas', 'back', 'bodyweight', 'kg'),
  ('Remo con Barra', 'back', 'barbell', 'kg'),
  ('Remo con Mancuerna', 'back', 'dumbbell', 'kg'),
  ('Jalón al Pecho', 'back', 'cable', 'kg'),

  -- Legs
  ('Sentadilla', 'legs', 'barbell', 'kg'),
  ('Prensa de Piernas', 'legs', 'machine', 'kg'),
  ('Peso Muerto Rumano', 'legs', 'barbell', 'kg'),
  ('Zancadas', 'legs', 'dumbbell', 'kg'),
  ('Curl Femoral', 'legs', 'machine', 'kg'),
  ('Extensión de Cuádriceps', 'legs', 'machine', 'kg'),
  ('Elevaciones de Talones', 'legs', 'machine', 'kg'),

  -- Shoulders
  ('Press Militar', 'shoulders', 'barbell', 'kg'),
  ('Press con Mancuernas', 'shoulders', 'dumbbell', 'kg'),
  ('Elevaciones Laterales', 'shoulders', 'dumbbell', 'kg'),
  ('Elevaciones Frontales', 'shoulders', 'dumbbell', 'kg'),
  ('Pájaros', 'shoulders', 'dumbbell', 'kg'),

  -- Arms
  ('Curl con Barra', 'arms', 'barbell', 'kg'),
  ('Curl con Mancuernas', 'arms', 'dumbbell', 'kg'),
  ('Curl Martillo', 'arms', 'dumbbell', 'kg'),
  ('Press Francés', 'arms', 'barbell', 'kg'),
  ('Extensión de Tríceps en Polea', 'arms', 'cable', 'kg'),
  ('Fondos para Tríceps', 'arms', 'bodyweight', 'kg'),

  -- Core
  ('Plancha', 'core', 'bodyweight', 'kg'),
  ('Abdominales', 'core', 'bodyweight', 'kg'),
  ('Elevación de Piernas', 'core', 'bodyweight', 'kg'),
  ('Russian Twist', 'core', 'bodyweight', 'kg');

-- Views for easier querying
CREATE OR REPLACE VIEW workout_feed AS
SELECT
  gc.id,
  gc.user_id,
  gc.date,
  gc.status,
  gc.linked_workout_id,
  u.display_name,
  u.username,
  u.avatar_url,
  w.routine_name,
  w.workout_type,
  w.duration_minutes,
  w.visibility
FROM gym_checkins gc
JOIN users u ON gc.user_id = u.id
LEFT JOIN workouts w ON gc.linked_workout_id = w.id
WHERE gc.status = 'WENT' OR w.visibility = 'PUBLIC' OR w.id IS NULL
ORDER BY gc.date DESC, gc.created_at DESC;
