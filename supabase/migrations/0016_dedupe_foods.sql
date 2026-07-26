-- =============================================
-- 0016 — Deduplicar alimentos de sistema
-- =============================================
-- El seed de alimentos se insertó más de una vez y la tabla `foods` no tenía
-- restricción de unicidad, así que quedaron duplicados. Esta migración:
--   1. Re-apunta cualquier meal_item que apunte a un duplicado al alimento que
--      se conserva (evita perder comidas ya registradas por el ON DELETE CASCADE).
--   2. Elimina los duplicados, conservando una fila por nombre.
--   3. Crea un índice único parcial para impedir duplicados a futuro.
-- Es idempotente: se puede correr varias veces sin problema.

-- 1) Re-apuntar meal_items de los duplicados al alimento conservado (menor ctid)
UPDATE meal_items mi
SET food_id = k.keep_id
FROM (
  SELECT id,
         first_value(id) OVER (PARTITION BY name ORDER BY ctid) AS keep_id
  FROM foods
  WHERE is_custom = false
) k
WHERE mi.food_id = k.id
  AND k.id <> k.keep_id;

-- 2) Borrar duplicados (conserva el de menor ctid por nombre)
DELETE FROM foods f
WHERE f.is_custom = false
  AND f.ctid <> (
    SELECT MIN(f2.ctid)
    FROM foods f2
    WHERE f2.is_custom = false
      AND f2.name = f.name
  );

-- 3) Índice único parcial: nombres de alimentos de sistema no se repiten.
--    (Los alimentos custom del usuario quedan fuera del índice a propósito.)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_system_food_name
  ON foods (name)
  WHERE is_custom = false;
