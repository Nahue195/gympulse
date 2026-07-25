-- ==========================================
-- CREAR TABLA EXERCISES E INSERTAR EJERCICIOS
-- ==========================================

-- ==========================================
-- PASO 1: Crear tabla exercises si no existe
-- ==========================================

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  description TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_is_custom ON exercises(is_custom);

-- ==========================================
-- PASO 2: Agregar columna category si no existe
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises' AND column_name = 'category'
    ) THEN
        ALTER TABLE exercises ADD COLUMN category TEXT;
    END IF;
END $$;

-- ==========================================
-- PASO 3: Limpiar ejercicios del sistema (opcional)
-- ==========================================
-- Descomenta la siguiente línea si quieres borrar los ejercicios existentes del sistema
-- DELETE FROM exercises WHERE is_custom = false OR is_custom IS NULL;

-- ==========================================
-- PASO 4: INSERTAR EJERCICIOS
-- ==========================================

-- EJERCICIOS DE PECHO
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Press de Banca Plano', 'Fuerza', 'Pecho', 'Barra', 'Ejercicio fundamental para desarrollo de pecho, tríceps y hombros frontales', false),
('Press de Banca Inclinado', 'Fuerza', 'Pecho', 'Barra', 'Enfocado en la parte superior del pecho', false),
('Press de Banca Declinado', 'Fuerza', 'Pecho', 'Barra', 'Enfocado en la parte inferior del pecho', false),
('Press con Mancuernas Plano', 'Fuerza', 'Pecho', 'Mancuernas', 'Mayor rango de movimiento que la barra', false),
('Press con Mancuernas Inclinado', 'Fuerza', 'Pecho', 'Mancuernas', 'Desarrollo del pecho superior con mancuernas', false),
('Aperturas con Mancuernas', 'Fuerza', 'Pecho', 'Mancuernas', 'Aislamiento del pecho, estiramiento profundo', false),
('Aperturas en Polea', 'Fuerza', 'Pecho', 'Poleas', 'Tensión constante en todo el rango de movimiento', false),
('Fondos en Paralelas', 'Fuerza', 'Pecho', 'Peso Corporal', 'Excelente para pecho inferior y tríceps', false),
('Flexiones', 'Fuerza', 'Pecho', 'Peso Corporal', 'Ejercicio básico efectivo para pecho', false),
('Flexiones Diamante', 'Fuerza', 'Pecho', 'Peso Corporal', 'Mayor énfasis en tríceps y pecho interno', false),
('Press en Máquina', 'Fuerza', 'Pecho', 'Máquina', 'Movimiento guiado para principiantes', false),
('Peck Deck', 'Fuerza', 'Pecho', 'Máquina', 'Aislamiento del pecho', false),
('Pullover con Mancuerna', 'Fuerza', 'Pecho', 'Mancuernas', 'Expande la caja torácica, trabaja pecho y dorsal', false);

-- EJERCICIOS DE ESPALDA
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Dominadas', 'Fuerza', 'Espalda', 'Peso Corporal', 'Ejercicio rey para desarrollo de espalda', false),
('Dominadas Supinas', 'Fuerza', 'Espalda', 'Peso Corporal', 'Mayor activación de bíceps', false),
('Remo con Barra', 'Fuerza', 'Espalda', 'Barra', 'Fundamental para grosor de espalda', false),
('Remo con Mancuerna', 'Fuerza', 'Espalda', 'Mancuernas', 'Aislamiento unilateral de espalda', false),
('Remo en Polea Baja', 'Fuerza', 'Espalda', 'Poleas', 'Enfoque en espalda media', false),
('Jalón al Pecho', 'Fuerza', 'Espalda', 'Poleas', 'Alternativa a las dominadas', false),
('Jalón Agarre Cerrado', 'Fuerza', 'Espalda', 'Poleas', 'Mayor activación del dorsal inferior', false),
('Peso Muerto', 'Fuerza', 'Espalda', 'Barra', 'Ejercicio compuesto fundamental para toda la espalda', false),
('Peso Muerto Rumano', 'Fuerza', 'Espalda', 'Barra', 'Enfoque en lumbares e isquiotibiales', false),
('Hiperextensiones', 'Fuerza', 'Espalda', 'Peso Corporal', 'Fortalecimiento de zona lumbar', false),
('Face Pull', 'Fuerza', 'Espalda', 'Poleas', 'Excelente para hombros posteriores y trapecio', false),
('Encogimientos con Barra', 'Fuerza', 'Espalda', 'Barra', 'Desarrollo de trapecio superior', false),
('Encogimientos con Mancuernas', 'Fuerza', 'Espalda', 'Mancuernas', 'Aislamiento de trapecio', false),
('Remo Pendlay', 'Fuerza', 'Espalda', 'Barra', 'Variación explosiva del remo con barra', false);

-- EJERCICIOS DE CUÁDRICEPS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Sentadilla Libre', 'Fuerza', 'Cuádriceps', 'Barra', 'Ejercicio rey para desarrollo de piernas', false),
('Sentadilla Frontal', 'Fuerza', 'Cuádriceps', 'Barra', 'Mayor activación de cuádriceps', false),
('Prensa de Piernas', 'Fuerza', 'Cuádriceps', 'Máquina', 'Alternativa segura a sentadilla', false),
('Sentadilla Búlgara', 'Fuerza', 'Cuádriceps', 'Mancuernas', 'Trabajo unilateral intenso', false),
('Zancadas con Barra', 'Fuerza', 'Cuádriceps', 'Barra', 'Desarrollo de piernas y estabilidad', false),
('Zancadas con Mancuernas', 'Fuerza', 'Cuádriceps', 'Mancuernas', 'Variante con mancuernas', false),
('Extensiones de Cuádriceps', 'Fuerza', 'Cuádriceps', 'Máquina', 'Aislamiento de cuádriceps', false),
('Hack Squat', 'Fuerza', 'Cuádriceps', 'Máquina', 'Variante de sentadilla en máquina', false),
('Sentadilla Goblet', 'Fuerza', 'Cuádriceps', 'Mancuernas', 'Excelente para aprender la técnica', false),
('Step-Ups', 'Fuerza', 'Cuádriceps', 'Mancuernas', 'Subidas a cajón para piernas', false);

-- EJERCICIOS DE ISQUIOTIBIALES
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Peso Muerto Piernas Rígidas', 'Fuerza', 'Isquiotibiales', 'Barra', 'Enfoque en isquiotibiales', false),
('Curl Femoral Acostado', 'Fuerza', 'Isquiotibiales', 'Máquina', 'Aislamiento de isquiotibiales', false),
('Curl Femoral Sentado', 'Fuerza', 'Isquiotibiales', 'Máquina', 'Variante sentada del curl femoral', false),
('Buenos Días', 'Fuerza', 'Isquiotibiales', 'Barra', 'Fortalecimiento de cadena posterior', false),
('Curl Nórdico', 'Fuerza', 'Isquiotibiales', 'Peso Corporal', 'Ejercicio avanzado muy efectivo', false),
('Glute Ham Raise', 'Fuerza', 'Isquiotibiales', 'Peso Corporal', 'Trabajo completo de cadena posterior', false);

-- EJERCICIOS DE GLÚTEOS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Hip Thrust con Barra', 'Fuerza', 'Glúteos', 'Barra', 'Mejor ejercicio para desarrollo de glúteos', false),
('Puente de Glúteos', 'Fuerza', 'Glúteos', 'Peso Corporal', 'Activación de glúteos', false),
('Patada de Glúteo', 'Fuerza', 'Glúteos', 'Poleas', 'Aislamiento de glúteos', false),
('Abducción de Cadera', 'Fuerza', 'Glúteos', 'Máquina', 'Trabajo de glúteo medio', false),
('Zancadas Inversas', 'Fuerza', 'Glúteos', 'Mancuernas', 'Mayor activación de glúteos', false);

-- EJERCICIOS DE PANTORRILLAS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Elevación de Talones de Pie', 'Fuerza', 'Pantorrillas', 'Máquina', 'Desarrollo de gemelos', false),
('Elevación de Talones Sentado', 'Fuerza', 'Pantorrillas', 'Máquina', 'Enfoque en sóleo', false),
('Elevación de Talones en Prensa', 'Fuerza', 'Pantorrillas', 'Máquina', 'Variante en prensa de piernas', false);

-- EJERCICIOS DE HOMBROS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Press Militar', 'Fuerza', 'Hombros', 'Barra', 'Ejercicio fundamental para hombros', false),
('Press con Mancuernas', 'Fuerza', 'Hombros', 'Mancuernas', 'Mayor rango de movimiento', false),
('Press Arnold', 'Fuerza', 'Hombros', 'Mancuernas', 'Variante que rota las mancuernas', false),
('Elevaciones Laterales', 'Fuerza', 'Hombros', 'Mancuernas', 'Aislamiento del deltoides lateral', false),
('Elevaciones Frontales', 'Fuerza', 'Hombros', 'Mancuernas', 'Trabajo del deltoides frontal', false),
('Pájaros', 'Fuerza', 'Hombros', 'Mancuernas', 'Desarrollo del deltoides posterior', false),
('Pájaros en Polea', 'Fuerza', 'Hombros', 'Poleas', 'Variante con tensión constante', false),
('Press en Máquina', 'Fuerza', 'Hombros', 'Máquina', 'Movimiento guiado para hombros', false),
('Elevaciones Laterales Polea', 'Fuerza', 'Hombros', 'Poleas', 'Tensión constante en laterales', false),
('Remo al Mentón', 'Fuerza', 'Hombros', 'Barra', 'Trabajo de deltoides y trapecio', false);

-- EJERCICIOS DE BÍCEPS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Curl con Barra', 'Fuerza', 'Bíceps', 'Barra', 'Ejercicio básico para bíceps', false),
('Curl con Barra Z', 'Fuerza', 'Bíceps', 'Barra Z', 'Menos tensión en muñecas', false),
('Curl con Mancuernas', 'Fuerza', 'Bíceps', 'Mancuernas', 'Mayor rango de movimiento', false),
('Curl Martillo', 'Fuerza', 'Bíceps', 'Mancuernas', 'Trabajo del braquial y antebrazo', false),
('Curl en Banco Scott', 'Fuerza', 'Bíceps', 'Barra Z', 'Aislamiento estricto de bíceps', false),
('Curl Concentrado', 'Fuerza', 'Bíceps', 'Mancuernas', 'Máximo aislamiento del bíceps', false),
('Curl en Polea', 'Fuerza', 'Bíceps', 'Poleas', 'Tensión constante', false),
('Curl 21s', 'Fuerza', 'Bíceps', 'Barra', 'Técnica de alto volumen', false),
('Curl Araña', 'Fuerza', 'Bíceps', 'Barra', 'Variante del curl en banco Scott', false);

-- EJERCICIOS DE TRÍCEPS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Press Banca Agarre Cerrado', 'Fuerza', 'Tríceps', 'Barra', 'Compuesto para tríceps', false),
('Extensiones Acostado', 'Fuerza', 'Tríceps', 'Barra Z', 'Aislamiento de tríceps', false),
('Extensiones en Polea', 'Fuerza', 'Tríceps', 'Poleas', 'Tensión constante', false),
('Extensiones con Cuerda', 'Fuerza', 'Tríceps', 'Poleas', 'Mayor activación de cabeza lateral', false),
('Patada de Tríceps', 'Fuerza', 'Tríceps', 'Mancuernas', 'Aislamiento unilateral', false),
('Fondos para Tríceps', 'Fuerza', 'Tríceps', 'Peso Corporal', 'Excelente ejercicio compuesto', false),
('Press Francés', 'Fuerza', 'Tríceps', 'Barra Z', 'Desarrollo de cabeza larga', false),
('Extensiones Overhead', 'Fuerza', 'Tríceps', 'Mancuernas', 'Estiramiento de cabeza larga', false);

-- EJERCICIOS DE ABDOMEN
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Crunch Abdominal', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Ejercicio básico para abdominales', false),
('Plancha', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Fortalecimiento isométrico del core', false),
('Plancha Lateral', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Trabajo de oblicuos', false),
('Elevación de Piernas', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Trabajo intenso de abdomen inferior', false),
('Elevación de Rodillas', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Versión más fácil de elevación de piernas', false),
('Russian Twist', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Rotación para oblicuos', false),
('Crunch en Polea', 'Fuerza', 'Abdomen', 'Poleas', 'Resistencia adicional para abdominales', false),
('Rueda Abdominal', 'Fuerza', 'Abdomen', 'Rueda Ab', 'Ejercicio avanzado para core completo', false),
('Mountain Climbers', 'Cardio', 'Abdomen', 'Peso Corporal', 'Ejercicio dinámico para core', false),
('Bicicleta Abdominal', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Trabajo de oblicuos y recto abdominal', false),
('Dead Bug', 'Fuerza', 'Abdomen', 'Peso Corporal', 'Control y estabilidad del core', false),
('Pallof Press', 'Fuerza', 'Abdomen', 'Poleas', 'Anti-rotación del core', false);

-- EJERCICIOS DE ANTEBRAZOS
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Curl de Muñeca', 'Fuerza', 'Antebrazos', 'Barra', 'Desarrollo de flexores del antebrazo', false),
('Curl de Muñeca Inverso', 'Fuerza', 'Antebrazos', 'Barra', 'Trabajo de extensores del antebrazo', false),
('Farmer Walk', 'Fuerza', 'Antebrazos', 'Mancuernas', 'Agarre y fortalecimiento funcional', false),
('Dead Hang', 'Fuerza', 'Antebrazos', 'Peso Corporal', 'Fortalecimiento de agarre', false);

-- EJERCICIOS DE CARDIO
INSERT INTO exercises (name, category, muscle_group, equipment, description, is_custom) VALUES
('Carrera en Cinta', 'Cardio', 'Piernas', 'Máquina', 'Cardio de bajo impacto', false),
('Bicicleta Estática', 'Cardio', 'Piernas', 'Máquina', 'Cardio de muy bajo impacto', false),
('Elíptica', 'Cardio', 'Piernas', 'Máquina', 'Cardio de cuerpo completo', false),
('Remo en Máquina', 'Cardio', 'Espalda', 'Máquina', 'Cardio de cuerpo completo', false),
('Saltar la Cuerda', 'Cardio', 'Piernas', 'Cuerda', 'Cardio de alta intensidad', false),
('Burpees', 'Cardio', 'Piernas', 'Peso Corporal', 'Ejercicio de cuerpo completo', false),
('Jumping Jacks', 'Cardio', 'Piernas', 'Peso Corporal', 'Calentamiento cardiovascular', false);

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

-- Ver resumen de ejercicios insertados
SELECT
    muscle_group,
    COUNT(*) as total_ejercicios
FROM exercises
WHERE is_custom = false
GROUP BY muscle_group
ORDER BY muscle_group;
