-- ==========================================
-- INSERTAR EJERCICIOS (VERSIÓN SIMPLE)
-- ==========================================

-- Primero, ver qué columnas tiene tu tabla exercises
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- ==========================================
-- Si la tabla NO existe, créala primero:
-- ==========================================
-- Descomenta las siguientes líneas si la tabla no existe

/*
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
*/

-- ==========================================
-- INSERTAR EJERCICIOS
-- ==========================================

-- EJERCICIOS DE PECHO
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Press de Banca Plano', 'Pecho', 'Barra', 'Ejercicio fundamental para desarrollo de pecho', 'Fuerza'),
('Press de Banca Inclinado', 'Pecho', 'Barra', 'Enfocado en la parte superior del pecho', 'Fuerza'),
('Press de Banca Declinado', 'Pecho', 'Barra', 'Enfocado en la parte inferior del pecho', 'Fuerza'),
('Press con Mancuernas Plano', 'Pecho', 'Mancuernas', 'Mayor rango de movimiento', 'Fuerza'),
('Press con Mancuernas Inclinado', 'Pecho', 'Mancuernas', 'Desarrollo del pecho superior', 'Fuerza'),
('Aperturas con Mancuernas', 'Pecho', 'Mancuernas', 'Aislamiento del pecho', 'Fuerza'),
('Aperturas en Polea', 'Pecho', 'Poleas', 'Tensión constante', 'Fuerza'),
('Fondos en Paralelas', 'Pecho', 'Peso Corporal', 'Para pecho inferior y tríceps', 'Fuerza'),
('Flexiones', 'Pecho', 'Peso Corporal', 'Ejercicio básico para pecho', 'Fuerza'),
('Press en Máquina', 'Pecho', 'Máquina', 'Movimiento guiado', 'Fuerza'),
('Peck Deck', 'Pecho', 'Máquina', 'Aislamiento del pecho', 'Fuerza');

-- EJERCICIOS DE ESPALDA
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Dominadas', 'Espalda', 'Peso Corporal', 'Ejercicio rey para espalda', 'Fuerza'),
('Dominadas Supinas', 'Espalda', 'Peso Corporal', 'Mayor activación de bíceps', 'Fuerza'),
('Remo con Barra', 'Espalda', 'Barra', 'Para grosor de espalda', 'Fuerza'),
('Remo con Mancuerna', 'Espalda', 'Mancuernas', 'Aislamiento unilateral', 'Fuerza'),
('Remo en Polea Baja', 'Espalda', 'Poleas', 'Enfoque en espalda media', 'Fuerza'),
('Jalón al Pecho', 'Espalda', 'Poleas', 'Alternativa a dominadas', 'Fuerza'),
('Peso Muerto', 'Espalda', 'Barra', 'Ejercicio compuesto fundamental', 'Fuerza'),
('Peso Muerto Rumano', 'Espalda', 'Barra', 'Para lumbares e isquiotibiales', 'Fuerza'),
('Face Pull', 'Espalda', 'Poleas', 'Para hombros posteriores', 'Fuerza'),
('Encogimientos con Barra', 'Espalda', 'Barra', 'Desarrollo de trapecio', 'Fuerza');

-- EJERCICIOS DE CUÁDRICEPS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Sentadilla Libre', 'Cuádriceps', 'Barra', 'Ejercicio rey para piernas', 'Fuerza'),
('Sentadilla Frontal', 'Cuádriceps', 'Barra', 'Mayor activación de cuádriceps', 'Fuerza'),
('Prensa de Piernas', 'Cuádriceps', 'Máquina', 'Alternativa a sentadilla', 'Fuerza'),
('Sentadilla Búlgara', 'Cuádriceps', 'Mancuernas', 'Trabajo unilateral', 'Fuerza'),
('Zancadas con Barra', 'Cuádriceps', 'Barra', 'Desarrollo y estabilidad', 'Fuerza'),
('Zancadas con Mancuernas', 'Cuádriceps', 'Mancuernas', 'Variante con mancuernas', 'Fuerza'),
('Extensiones de Cuádriceps', 'Cuádriceps', 'Máquina', 'Aislamiento de cuádriceps', 'Fuerza'),
('Hack Squat', 'Cuádriceps', 'Máquina', 'Sentadilla en máquina', 'Fuerza'),
('Sentadilla Goblet', 'Cuádriceps', 'Mancuernas', 'Para aprender técnica', 'Fuerza');

-- EJERCICIOS DE ISQUIOTIBIALES
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Peso Muerto Piernas Rígidas', 'Isquiotibiales', 'Barra', 'Enfoque en isquiotibiales', 'Fuerza'),
('Curl Femoral Acostado', 'Isquiotibiales', 'Máquina', 'Aislamiento', 'Fuerza'),
('Curl Femoral Sentado', 'Isquiotibiales', 'Máquina', 'Variante sentada', 'Fuerza'),
('Buenos Días', 'Isquiotibiales', 'Barra', 'Cadena posterior', 'Fuerza'),
('Curl Nórdico', 'Isquiotibiales', 'Peso Corporal', 'Ejercicio avanzado', 'Fuerza');

-- EJERCICIOS DE GLÚTEOS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Hip Thrust con Barra', 'Glúteos', 'Barra', 'Mejor para glúteos', 'Fuerza'),
('Puente de Glúteos', 'Glúteos', 'Peso Corporal', 'Activación de glúteos', 'Fuerza'),
('Patada de Glúteo', 'Glúteos', 'Poleas', 'Aislamiento', 'Fuerza'),
('Abducción de Cadera', 'Glúteos', 'Máquina', 'Glúteo medio', 'Fuerza');

-- EJERCICIOS DE PANTORRILLAS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Elevación de Talones de Pie', 'Pantorrillas', 'Máquina', 'Desarrollo de gemelos', 'Fuerza'),
('Elevación de Talones Sentado', 'Pantorrillas', 'Máquina', 'Enfoque en sóleo', 'Fuerza');

-- EJERCICIOS DE HOMBROS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Press Militar', 'Hombros', 'Barra', 'Fundamental para hombros', 'Fuerza'),
('Press con Mancuernas', 'Hombros', 'Mancuernas', 'Mayor rango de movimiento', 'Fuerza'),
('Press Arnold', 'Hombros', 'Mancuernas', 'Rotación de mancuernas', 'Fuerza'),
('Elevaciones Laterales', 'Hombros', 'Mancuernas', 'Deltoides lateral', 'Fuerza'),
('Elevaciones Frontales', 'Hombros', 'Mancuernas', 'Deltoides frontal', 'Fuerza'),
('Pájaros', 'Hombros', 'Mancuernas', 'Deltoides posterior', 'Fuerza'),
('Pájaros en Polea', 'Hombros', 'Poleas', 'Tensión constante', 'Fuerza'),
('Remo al Mentón', 'Hombros', 'Barra', 'Deltoides y trapecio', 'Fuerza');

-- EJERCICIOS DE BÍCEPS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Curl con Barra', 'Bíceps', 'Barra', 'Básico para bíceps', 'Fuerza'),
('Curl con Barra Z', 'Bíceps', 'Barra Z', 'Menos tensión en muñecas', 'Fuerza'),
('Curl con Mancuernas', 'Bíceps', 'Mancuernas', 'Mayor rango', 'Fuerza'),
('Curl Martillo', 'Bíceps', 'Mancuernas', 'Braquial y antebrazo', 'Fuerza'),
('Curl en Banco Scott', 'Bíceps', 'Barra Z', 'Aislamiento estricto', 'Fuerza'),
('Curl Concentrado', 'Bíceps', 'Mancuernas', 'Máximo aislamiento', 'Fuerza'),
('Curl en Polea', 'Bíceps', 'Poleas', 'Tensión constante', 'Fuerza');

-- EJERCICIOS DE TRÍCEPS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Press Banca Agarre Cerrado', 'Tríceps', 'Barra', 'Compuesto para tríceps', 'Fuerza'),
('Extensiones Acostado', 'Tríceps', 'Barra Z', 'Aislamiento de tríceps', 'Fuerza'),
('Extensiones en Polea', 'Tríceps', 'Poleas', 'Tensión constante', 'Fuerza'),
('Extensiones con Cuerda', 'Tríceps', 'Poleas', 'Cabeza lateral', 'Fuerza'),
('Patada de Tríceps', 'Tríceps', 'Mancuernas', 'Aislamiento unilateral', 'Fuerza'),
('Fondos para Tríceps', 'Tríceps', 'Peso Corporal', 'Ejercicio compuesto', 'Fuerza'),
('Press Francés', 'Tríceps', 'Barra Z', 'Cabeza larga', 'Fuerza');

-- EJERCICIOS DE ABDOMEN
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Crunch Abdominal', 'Abdomen', 'Peso Corporal', 'Básico para abdominales', 'Fuerza'),
('Plancha', 'Abdomen', 'Peso Corporal', 'Isométrico del core', 'Fuerza'),
('Plancha Lateral', 'Abdomen', 'Peso Corporal', 'Trabajo de oblicuos', 'Fuerza'),
('Elevación de Piernas', 'Abdomen', 'Peso Corporal', 'Abdomen inferior', 'Fuerza'),
('Russian Twist', 'Abdomen', 'Peso Corporal', 'Rotación para oblicuos', 'Fuerza'),
('Crunch en Polea', 'Abdomen', 'Poleas', 'Con resistencia', 'Fuerza'),
('Rueda Abdominal', 'Abdomen', 'Rueda Ab', 'Core completo', 'Fuerza'),
('Mountain Climbers', 'Abdomen', 'Peso Corporal', 'Dinámico para core', 'Cardio'),
('Bicicleta Abdominal', 'Abdomen', 'Peso Corporal', 'Oblicuos y recto', 'Fuerza');

-- EJERCICIOS DE ANTEBRAZOS
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Curl de Muñeca', 'Antebrazos', 'Barra', 'Flexores del antebrazo', 'Fuerza'),
('Curl de Muñeca Inverso', 'Antebrazos', 'Barra', 'Extensores', 'Fuerza'),
('Farmer Walk', 'Antebrazos', 'Mancuernas', 'Agarre funcional', 'Fuerza');

-- EJERCICIOS DE CARDIO
INSERT INTO exercises (name, muscle_group, equipment, description, category) VALUES
('Carrera en Cinta', 'Piernas', 'Máquina', 'Cardio bajo impacto', 'Cardio'),
('Bicicleta Estática', 'Piernas', 'Máquina', 'Cardio muy bajo impacto', 'Cardio'),
('Elíptica', 'Piernas', 'Máquina', 'Cardio cuerpo completo', 'Cardio'),
('Remo en Máquina', 'Espalda', 'Máquina', 'Cardio cuerpo completo', 'Cardio'),
('Saltar la Cuerda', 'Piernas', 'Cuerda', 'Cardio alta intensidad', 'Cardio'),
('Burpees', 'Piernas', 'Peso Corporal', 'Cuerpo completo', 'Cardio');

-- Ver resumen
SELECT muscle_group, COUNT(*) as total
FROM exercises
GROUP BY muscle_group
ORDER BY muscle_group;
