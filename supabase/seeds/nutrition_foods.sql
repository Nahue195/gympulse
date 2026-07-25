-- =============================================
-- GymPulse Foods Database Seed
-- =============================================
-- Execute AFTER supabase-nutrition-schema.sql

-- Clear existing system foods (optional, comment out if you want to keep existing)
-- DELETE FROM foods WHERE is_custom = false;

-- ==========================================
-- PROTEINAS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, is_custom) VALUES
-- Carnes
('Pechuga de pollo', 'proteins', 100, 'g', 165, 31, 0, 3.6, false),
('Muslo de pollo', 'proteins', 100, 'g', 209, 26, 0, 10.9, false),
('Carne de res magra', 'proteins', 100, 'g', 250, 26, 0, 15, false),
('Carne molida 90/10', 'proteins', 100, 'g', 176, 20, 0, 10, false),
('Lomo de cerdo', 'proteins', 100, 'g', 143, 26, 0, 3.5, false),
('Pavo molido', 'proteins', 100, 'g', 149, 20, 0, 8, false),
('Jamon de pavo', 'proteins', 30, 'g', 30, 5, 1, 0.5, false),
('Tocino', 'proteins', 30, 'g', 161, 12, 0.4, 12, false),

-- Pescados y mariscos
('Salmon', 'proteins', 100, 'g', 208, 20, 0, 13, false),
('Atun fresco', 'proteins', 100, 'g', 144, 23, 0, 5, false),
('Atun en lata (agua)', 'proteins', 100, 'g', 116, 26, 0, 1, false),
('Tilapia', 'proteins', 100, 'g', 96, 20, 0, 1.7, false),
('Camarones', 'proteins', 100, 'g', 99, 24, 0.2, 0.3, false),
('Merluza', 'proteins', 100, 'g', 90, 18, 0, 1.5, false),

-- Huevos
('Huevo entero', 'proteins', 50, 'g', 78, 6, 0.6, 5, false),
('Clara de huevo', 'proteins', 33, 'g', 17, 3.6, 0.2, 0, false),
('Huevo revuelto', 'proteins', 100, 'g', 149, 10, 2, 11, false),

-- Legumbres
('Lentejas cocidas', 'proteins', 100, 'g', 116, 9, 20, 0.4, false),
('Garbanzos cocidos', 'proteins', 100, 'g', 164, 9, 27, 2.6, false),
('Frijoles negros cocidos', 'proteins', 100, 'g', 132, 9, 24, 0.5, false),
('Frijoles rojos cocidos', 'proteins', 100, 'g', 127, 9, 23, 0.5, false),
('Edamame', 'proteins', 100, 'g', 121, 12, 9, 5, false),

-- Proteinas vegetales
('Tofu firme', 'proteins', 100, 'g', 144, 17, 3, 9, false),
('Tempeh', 'proteins', 100, 'g', 192, 20, 8, 11, false),
('Seitan', 'proteins', 100, 'g', 370, 75, 14, 2, false);

-- ==========================================
-- CARBOHIDRATOS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, is_custom) VALUES
-- Granos
('Arroz blanco cocido', 'carbs', 100, 'g', 130, 2.7, 28, 0.3, 0.4, false),
('Arroz integral cocido', 'carbs', 100, 'g', 123, 2.7, 26, 1, 1.8, false),
('Quinoa cocida', 'carbs', 100, 'g', 120, 4.4, 21, 1.9, 2.8, false),
('Avena', 'carbs', 40, 'g', 152, 5.3, 27, 2.7, 4, false),
('Pan integral', 'carbs', 30, 'g', 69, 3.5, 12, 1.1, 2, false),
('Pan blanco', 'carbs', 30, 'g', 79, 2.7, 15, 1, 0.6, false),
('Pasta cocida', 'carbs', 100, 'g', 131, 5, 25, 1.1, 1.8, false),
('Tortilla de maiz', 'carbs', 30, 'g', 68, 1.8, 14, 0.9, 1.5, false),
('Tortilla de harina', 'carbs', 45, 'g', 140, 3.5, 24, 3.5, 1.5, false),

-- Tuberculos
('Papa cocida', 'carbs', 100, 'g', 87, 1.9, 20, 0.1, 1.8, false),
('Batata/Camote cocido', 'carbs', 100, 'g', 90, 2, 21, 0.1, 3, false),
('Yuca cocida', 'carbs', 100, 'g', 160, 1.4, 38, 0.3, 1.8, false),
('Platano macho cocido', 'carbs', 100, 'g', 122, 1.3, 32, 0.4, 2.3, false),

-- Cereales
('Cereal de maiz', 'carbs', 30, 'g', 113, 2, 25, 0.4, 0.8, false),
('Granola', 'carbs', 40, 'g', 196, 4, 32, 7, 3.3, false),
('Muesli', 'carbs', 40, 'g', 150, 4, 27, 3, 3, false);

-- ==========================================
-- VEGETALES
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, is_custom) VALUES
('Brocoli', 'vegetables', 100, 'g', 34, 2.8, 7, 0.4, 2.6, false),
('Espinaca', 'vegetables', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2, false),
('Lechuga romana', 'vegetables', 100, 'g', 17, 1.2, 3.3, 0.3, 2.1, false),
('Tomate', 'vegetables', 100, 'g', 18, 0.9, 3.9, 0.2, 1.2, false),
('Pepino', 'vegetables', 100, 'g', 15, 0.7, 3.6, 0.1, 0.5, false),
('Zanahoria', 'vegetables', 100, 'g', 41, 0.9, 10, 0.2, 2.8, false),
('Pimiento rojo', 'vegetables', 100, 'g', 31, 1, 6, 0.3, 2.1, false),
('Pimiento verde', 'vegetables', 100, 'g', 20, 0.9, 4.6, 0.2, 1.7, false),
('Cebolla', 'vegetables', 100, 'g', 40, 1.1, 9.3, 0.1, 1.7, false),
('Ajo', 'vegetables', 10, 'g', 15, 0.6, 3.3, 0, 0.2, false),
('Calabacin', 'vegetables', 100, 'g', 17, 1.2, 3.1, 0.3, 1, false),
('Berenjena', 'vegetables', 100, 'g', 25, 1, 6, 0.2, 3, false),
('Coliflor', 'vegetables', 100, 'g', 25, 1.9, 5, 0.3, 2, false),
('Apio', 'vegetables', 100, 'g', 16, 0.7, 3, 0.2, 1.6, false),
('Champiñones', 'vegetables', 100, 'g', 22, 3.1, 3.3, 0.3, 1, false),
('Aguacate', 'vegetables', 100, 'g', 160, 2, 9, 15, 7, false),
('Elote/Maiz', 'vegetables', 100, 'g', 96, 3.4, 21, 1.5, 2.4, false),
('Espárragos', 'vegetables', 100, 'g', 20, 2.2, 3.9, 0.1, 2.1, false),
('Repollo', 'vegetables', 100, 'g', 25, 1.3, 6, 0.1, 2.5, false),
('Kale', 'vegetables', 100, 'g', 49, 4.3, 9, 0.9, 3.6, false);

-- ==========================================
-- FRUTAS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, is_custom) VALUES
('Manzana', 'fruits', 150, 'unidad', 78, 0.4, 21, 0.3, 3.6, 15.5, false),
('Banana/Platano', 'fruits', 120, 'unidad', 105, 1.3, 27, 0.4, 3.1, 14.4, false),
('Naranja', 'fruits', 150, 'unidad', 69, 1.3, 17, 0.2, 3.4, 12.2, false),
('Fresa', 'fruits', 100, 'g', 32, 0.7, 7.7, 0.3, 2, 4.9, false),
('Arandanos', 'fruits', 100, 'g', 57, 0.7, 14, 0.3, 2.4, 10, false),
('Uvas', 'fruits', 100, 'g', 69, 0.7, 18, 0.2, 0.9, 16, false),
('Sandia', 'fruits', 200, 'g', 60, 1.2, 15, 0.3, 0.8, 12.4, false),
('Melon', 'fruits', 200, 'g', 72, 1.7, 17, 0.4, 1.8, 15.6, false),
('Piña', 'fruits', 150, 'g', 75, 0.8, 20, 0.2, 2.1, 14.9, false),
('Mango', 'fruits', 150, 'g', 99, 1.4, 25, 0.6, 2.6, 22.5, false),
('Papaya', 'fruits', 150, 'g', 59, 0.9, 15, 0.2, 2.7, 10.5, false),
('Kiwi', 'fruits', 75, 'unidad', 46, 0.8, 11, 0.4, 2.3, 6.8, false),
('Pera', 'fruits', 150, 'unidad', 85, 0.5, 23, 0.2, 4.7, 14.6, false),
('Durazno', 'fruits', 150, 'unidad', 58, 1.4, 14, 0.4, 2.3, 12.6, false),
('Mandarina', 'fruits', 80, 'unidad', 42, 0.6, 11, 0.2, 1.4, 8.5, false),
('Cereza', 'fruits', 100, 'g', 63, 1.1, 16, 0.2, 2.1, 12.8, false);

-- ==========================================
-- LACTEOS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, is_custom) VALUES
('Leche entera', 'dairy', 250, 'ml', 149, 8, 12, 8, false),
('Leche descremada', 'dairy', 250, 'ml', 83, 8, 12, 0.2, false),
('Leche deslactosada', 'dairy', 250, 'ml', 130, 8, 12, 5, false),
('Yogur natural', 'dairy', 150, 'g', 92, 5.3, 7, 5, false),
('Yogur griego', 'dairy', 150, 'g', 146, 15, 6, 7.5, false),
('Yogur griego 0%', 'dairy', 150, 'g', 89, 15, 6, 0, false),
('Queso cottage', 'dairy', 100, 'g', 98, 11, 3.4, 4.3, false),
('Queso mozzarella', 'dairy', 30, 'g', 85, 6, 0.6, 6.3, false),
('Queso cheddar', 'dairy', 30, 'g', 120, 7, 0.4, 10, false),
('Queso panela', 'dairy', 30, 'g', 80, 7, 1, 5, false),
('Queso oaxaca', 'dairy', 30, 'g', 90, 6, 1, 7, false),
('Queso crema', 'dairy', 30, 'g', 99, 1.7, 1.6, 10, false),
('Crema agria', 'dairy', 30, 'g', 60, 0.7, 1.2, 6, false),
('Mantequilla', 'dairy', 10, 'g', 72, 0.1, 0, 8, false);

-- ==========================================
-- GRASAS Y ACEITES
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, is_custom) VALUES
('Aceite de oliva', 'fats', 15, 'ml', 119, 0, 0, 13.5, false),
('Aceite de coco', 'fats', 15, 'ml', 121, 0, 0, 13.5, false),
('Aceite vegetal', 'fats', 15, 'ml', 120, 0, 0, 14, false),
('Almendras', 'fats', 30, 'g', 173, 6, 6, 15, false),
('Nueces', 'fats', 30, 'g', 196, 4.6, 4, 20, false),
('Cacahuates/Mani', 'fats', 30, 'g', 170, 7, 5, 14, false),
('Semillas de chia', 'fats', 15, 'g', 73, 2.5, 6, 4.6, false),
('Semillas de linaza', 'fats', 15, 'g', 80, 2.7, 4.3, 6.3, false),
('Crema de cacahuate', 'fats', 30, 'g', 188, 8, 6, 16, false),
('Crema de almendras', 'fats', 30, 'g', 196, 6.7, 6, 18, false),
('Mayonesa', 'fats', 15, 'g', 94, 0.1, 0.1, 10, false),
('Mayonesa light', 'fats', 15, 'g', 35, 0, 2, 3, false);

-- ==========================================
-- BEBIDAS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, sugar, is_custom) VALUES
('Cafe negro', 'beverages', 240, 'ml', 2, 0.3, 0, 0, 0, false),
('Cafe con leche', 'beverages', 240, 'ml', 67, 4, 6, 3, 6, false),
('Te verde', 'beverages', 240, 'ml', 2, 0, 0.5, 0, 0, false),
('Jugo de naranja natural', 'beverages', 250, 'ml', 112, 1.7, 26, 0.5, 21, false),
('Refresco/Soda', 'beverages', 355, 'ml', 140, 0, 39, 0, 39, false),
('Refresco light/Zero', 'beverages', 355, 'ml', 0, 0, 0, 0, 0, false),
('Agua de coco', 'beverages', 250, 'ml', 46, 1.7, 9, 0.5, 6, false),
('Bebida deportiva', 'beverages', 500, 'ml', 125, 0, 30, 0, 30, false),
('Leche de almendras', 'beverages', 250, 'ml', 39, 1.4, 3.4, 2.5, 2, false),
('Leche de avena', 'beverages', 250, 'ml', 120, 3, 16, 5, 7, false),
('Leche de soya', 'beverages', 250, 'ml', 105, 6, 12, 3.5, 9, false);

-- ==========================================
-- SNACKS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, is_custom) VALUES
('Barra de proteina', 'snacks', 60, 'g', 200, 20, 22, 7, false),
('Galletas de avena', 'snacks', 30, 'g', 130, 2, 20, 5, false),
('Chips/Papas fritas', 'snacks', 30, 'g', 160, 2, 15, 10, false),
('Palomitas de maiz', 'snacks', 30, 'g', 120, 3.5, 22, 1.5, false),
('Chocolate oscuro 70%', 'snacks', 30, 'g', 170, 2.2, 13, 12, false),
('Helado de vainilla', 'snacks', 100, 'g', 207, 3.5, 24, 11, false),
('Galletas Maria', 'snacks', 30, 'g', 130, 2, 22, 4, false),
('Frutos secos mixtos', 'snacks', 30, 'g', 173, 5, 8, 15, false),
('Proteina en polvo (whey)', 'snacks', 30, 'g', 120, 24, 3, 1.5, false),
('Creatina', 'snacks', 5, 'g', 0, 0, 0, 0, false);

-- ==========================================
-- COMIDAS PREPARADAS
-- ==========================================

INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, is_custom) VALUES
('Pizza (1 rebanada)', 'prepared', 100, 'g', 266, 11, 33, 10, false),
('Hamburguesa completa', 'prepared', 200, 'g', 540, 25, 40, 29, false),
('Tacos (2 piezas)', 'prepared', 150, 'g', 350, 18, 30, 18, false),
('Burrito', 'prepared', 200, 'g', 400, 15, 45, 17, false),
('Sushi roll (8 piezas)', 'prepared', 180, 'g', 350, 15, 50, 10, false),
('Ensalada Caesar', 'prepared', 200, 'g', 180, 7, 8, 14, false),
('Sandwich de jamon y queso', 'prepared', 150, 'g', 352, 15, 30, 18, false),
('Sopa de pollo', 'prepared', 250, 'ml', 75, 6, 8, 2, false),
('Arroz con pollo', 'prepared', 250, 'g', 320, 20, 40, 8, false),
('Pasta con salsa roja', 'prepared', 250, 'g', 280, 10, 45, 6, false);

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT category, COUNT(*) as count
FROM foods
WHERE is_custom = false
GROUP BY category
ORDER BY category;

SELECT COUNT(*) as total_foods FROM foods WHERE is_custom = false;
