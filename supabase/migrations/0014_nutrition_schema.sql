-- =============================================
-- GymPulse Nutrition System Schema
-- =============================================
-- Execute this SQL in Supabase SQL Editor

-- ==========================================
-- ENUMS
-- ==========================================

-- CREATE TYPE no soporta IF NOT EXISTS, así que lo hacemos idempotente a mano.
DO $$ BEGIN
  CREATE TYPE food_category AS ENUM (
    'proteins', 'carbs', 'vegetables', 'fruits', 'dairy',
    'fats', 'beverages', 'snacks', 'prepared', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE diet_type AS ENUM (
    'balanced', 'high_protein', 'low_carb', 'keto', 'vegetarian', 'vegan'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==========================================
-- TABLES
-- ==========================================

-- Foods database (both system and user-created)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category food_category NOT NULL DEFAULT 'other',
  serving_size DECIMAL(10,2) NOT NULL DEFAULT 100, -- grams
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories DECIMAL(10,2) NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
  fat DECIMAL(10,2) NOT NULL DEFAULT 0,
  fiber DECIMAL(10,2),
  sugar DECIMAL(10,2),
  sodium DECIMAL(10,2),
  is_custom BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal entries (each meal logged by user)
CREATE TABLE IF NOT EXISTS meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type meal_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal items (foods within a meal entry)
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_entry_id UUID NOT NULL REFERENCES meal_entries(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1, -- number of servings
  calories DECIMAL(10,2) NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  fat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  diet_type diet_type NOT NULL DEFAULT 'balanced',
  target_calories INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  target_carbs INTEGER NOT NULL,
  target_fat INTEGER NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Days within a meal plan
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  notes TEXT,
  UNIQUE(meal_plan_id, day_number)
);

-- Meals within each day of a plan
CREATE TABLE IF NOT EXISTS meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID NOT NULL REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL
);

-- User nutrition goals/settings
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  protein_percentage INTEGER NOT NULL DEFAULT 30,
  carbs_percentage INTEGER NOT NULL DEFAULT 40,
  fat_percentage INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON meal_entries(date);
CREATE INDEX IF NOT EXISTS idx_meal_items_entry ON meal_items(meal_entry_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan ON meal_plan_days(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_day ON meal_plan_meals(meal_plan_day_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Foods table
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Everyone can view system foods
DROP POLICY IF EXISTS "Anyone can view system foods" ON foods;
CREATE POLICY "Anyone can view system foods"
  ON foods FOR SELECT
  USING (is_custom = false OR user_id = auth.uid());

-- Users can create custom foods
DROP POLICY IF EXISTS "Users can create custom foods" ON foods;
CREATE POLICY "Users can create custom foods"
  ON foods FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_custom = true);

-- Users can update their custom foods
DROP POLICY IF EXISTS "Users can update own foods" ON foods;
CREATE POLICY "Users can update own foods"
  ON foods FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their custom foods
DROP POLICY IF EXISTS "Users can delete own foods" ON foods;
CREATE POLICY "Users can delete own foods"
  ON foods FOR DELETE
  USING (user_id = auth.uid());

-- Meal entries table
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal entries" ON meal_entries;
CREATE POLICY "Users can view own meal entries"
  ON meal_entries FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create meal entries" ON meal_entries;
CREATE POLICY "Users can create meal entries"
  ON meal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own meal entries" ON meal_entries;
CREATE POLICY "Users can update own meal entries"
  ON meal_entries FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own meal entries" ON meal_entries;
CREATE POLICY "Users can delete own meal entries"
  ON meal_entries FOR DELETE
  USING (user_id = auth.uid());

-- Meal items table
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal items" ON meal_items;
CREATE POLICY "Users can view own meal items"
  ON meal_items FOR SELECT
  USING (
    meal_entry_id IN (
      SELECT id FROM meal_entries WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create meal items" ON meal_items;
CREATE POLICY "Users can create meal items"
  ON meal_items FOR INSERT
  WITH CHECK (
    meal_entry_id IN (
      SELECT id FROM meal_entries WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own meal items" ON meal_items;
CREATE POLICY "Users can update own meal items"
  ON meal_items FOR UPDATE
  USING (
    meal_entry_id IN (
      SELECT id FROM meal_entries WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own meal items" ON meal_items;
CREATE POLICY "Users can delete own meal items"
  ON meal_items FOR DELETE
  USING (
    meal_entry_id IN (
      SELECT id FROM meal_entries WHERE user_id = auth.uid()
    )
  );

-- Meal plans table
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create meal plans" ON meal_plans;
CREATE POLICY "Users can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (user_id = auth.uid());

-- Meal plan days table
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plan days" ON meal_plan_days;
CREATE POLICY "Users can view own meal plan days"
  ON meal_plan_days FOR SELECT
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own meal plan days" ON meal_plan_days;
CREATE POLICY "Users can manage own meal plan days"
  ON meal_plan_days FOR ALL
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Meal plan meals table
ALTER TABLE meal_plan_meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plan meals" ON meal_plan_meals;
CREATE POLICY "Users can view own meal plan meals"
  ON meal_plan_meals FOR SELECT
  USING (
    meal_plan_day_id IN (
      SELECT mpd.id FROM meal_plan_days mpd
      JOIN meal_plans mp ON mpd.meal_plan_id = mp.id
      WHERE mp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own meal plan meals" ON meal_plan_meals;
CREATE POLICY "Users can manage own meal plan meals"
  ON meal_plan_meals FOR ALL
  USING (
    meal_plan_day_id IN (
      SELECT mpd.id FROM meal_plan_days mpd
      JOIN meal_plans mp ON mpd.meal_plan_id = mp.id
      WHERE mp.user_id = auth.uid()
    )
  );

-- User nutrition goals
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nutrition goals" ON user_nutrition_goals;
CREATE POLICY "Users can view own nutrition goals"
  ON user_nutrition_goals FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own nutrition goals" ON user_nutrition_goals;
CREATE POLICY "Users can manage own nutrition goals"
  ON user_nutrition_goals FOR ALL
  USING (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to get daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_nutrition(p_user_id UUID, p_date DATE)
RETURNS TABLE (
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(mi.calories), 0) as total_calories,
    COALESCE(SUM(mi.protein), 0) as total_protein,
    COALESCE(SUM(mi.carbs), 0) as total_carbs,
    COALESCE(SUM(mi.fat), 0) as total_fat
  FROM meal_entries me
  JOIN meal_items mi ON me.id = mi.meal_entry_id
  WHERE me.user_id = p_user_id AND me.date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to ensure only one active meal plan per user
CREATE OR REPLACE FUNCTION ensure_single_active_meal_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE meal_plans
    SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_meal_plan ON meal_plans;
CREATE TRIGGER trigger_single_active_meal_plan
  BEFORE INSERT OR UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_meal_plan();

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('foods', 'meal_entries', 'meal_items', 'meal_plans', 'meal_plan_days', 'meal_plan_meals', 'user_nutrition_goals')
ORDER BY table_name;
