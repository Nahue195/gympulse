-- ==========================================
-- VERIFICAR MIS RUTINAS
-- ==========================================

-- Ver TODAS las rutinas (activas e inactivas)
SELECT
  id,
  routine_name,
  is_active,
  total_days,
  workout_type,
  created_at
FROM routines
ORDER BY created_at DESC;

-- Ver días de cada rutina
SELECT
  r.routine_name,
  rd.day_number,
  rd.day_name,
  COUNT(re.id) as ejercicios_count
FROM routines r
LEFT JOIN routine_days rd ON rd.routine_id = r.id
LEFT JOIN routine_exercises re ON re.routine_day_id = rd.id
GROUP BY r.id, r.routine_name, rd.id, rd.day_number, rd.day_name
ORDER BY r.routine_name, rd.day_number;

-- Si todas tus rutinas tienen is_active = false, ejecuta esto para activarlas:
-- UPDATE routines SET is_active = true WHERE is_active = false;
