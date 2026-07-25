// Lógica pura de nutrición (sin dependencias de React ni Supabase).
// Testeada en nutrition.test.ts.

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Calorías por gramo de cada macronutriente. */
export const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export interface NutritionGoals {
  dailyCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

/** Objetivos por defecto cuando el usuario todavía no configuró los suyos. */
export const DEFAULT_GOALS: NutritionGoals = {
  dailyCalories: 2000,
  proteinPercentage: 30,
  carbsPercentage: 40,
  fatPercentage: 30,
};

/**
 * Convierte objetivos calóricos + reparto porcentual en gramos objetivo por macro.
 * Redondea a gramos enteros.
 */
export function macroGramsFromGoals(goals: NutritionGoals): MacroTotals {
  const { dailyCalories, proteinPercentage, carbsPercentage, fatPercentage } = goals;
  return {
    calories: dailyCalories,
    protein: Math.round((dailyCalories * proteinPercentage) / 100 / CALORIES_PER_GRAM.protein),
    carbs: Math.round((dailyCalories * carbsPercentage) / 100 / CALORIES_PER_GRAM.carbs),
    fat: Math.round((dailyCalories * fatPercentage) / 100 / CALORIES_PER_GRAM.fat),
  };
}

/** Macros de una porción base de alimento (por serving). */
export interface FoodMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calcula los macros de un ítem = macros del alimento × cantidad de porciones.
 * Redondea a 1 decimal para evitar ruido de coma flotante.
 */
export function computeItemMacros(food: FoodMacros, quantity: number): MacroTotals {
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    calories: round1(food.calories * q),
    protein: round1(food.protein * q),
    carbs: round1(food.carbs * q),
    fat: round1(food.fat * q),
  };
}

/** Suma una lista de macros en un total. */
export function sumMacros(items: MacroTotals[]): MacroTotals {
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const total = items.reduce<MacroTotals>(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: round1(total.calories),
    protein: round1(total.protein),
    carbs: round1(total.carbs),
    fat: round1(total.fat),
  };
}

/**
 * Porcentaje consumido respecto del objetivo, acotado a [0, 100] para barras de
 * progreso. Si el objetivo es 0, devuelve 0.
 */
export function progressPct(consumed: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((consumed / goal) * 100)));
}
