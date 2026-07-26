-- =============================================
-- 0017 — Agregar "merienda" al enum meal_type
-- =============================================
-- Nueva comida entre almuerzo y cena. IF NOT EXISTS lo hace idempotente.
-- (ALTER TYPE ... ADD VALUE no puede correr dentro de una transacción explícita;
--  en el SQL Editor de Supabase se ejecuta suelto sin problema.)

ALTER TYPE meal_type ADD VALUE IF NOT EXISTS 'merienda' BEFORE 'dinner';
