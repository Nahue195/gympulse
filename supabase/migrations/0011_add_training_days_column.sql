-- Agregar columna training_days a la tabla users
-- training_days es un array de integers donde 1=Lunes, 2=Martes, ..., 6=Sábado
-- Por defecto: [1, 3, 5] = Lunes, Miércoles, Viernes

ALTER TABLE users
ADD COLUMN IF NOT EXISTS training_days integer[] DEFAULT ARRAY[1, 3, 5];

-- Actualizar usuarios existentes que no tengan el valor
UPDATE users
SET training_days = ARRAY[1, 3, 5]
WHERE training_days IS NULL;
