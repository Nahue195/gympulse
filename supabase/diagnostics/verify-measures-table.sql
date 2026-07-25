-- ==========================================
-- VERIFICAR TABLA DE MEDICIONES
-- ==========================================

-- Ver si existe la tabla measures
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'measures'
) as measures_exists;

-- Ver estructura de la tabla measures
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'measures'
ORDER BY ordinal_position;

-- Ver datos existentes
SELECT * FROM measures ORDER BY date DESC LIMIT 5;

-- Si la tabla no existe, créala::
/*
CREATE TABLE IF NOT EXISTS measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2) NOT NULL,
  neck_cm NUMERIC(4,1),
  chest_cm NUMERIC(4,1),
  waist_cm NUMERIC(4,1),
  hip_cm NUMERIC(4,1),
  arm_cm NUMERIC(4,1),
  thigh_cm NUMERIC(4,1),
  body_fat_pct NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measures_user_id ON measures(user_id);
CREATE INDEX IF NOT EXISTS idx_measures_date ON measures(date DESC);
*/
