import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database, MealType } from '../types/database';
import {
  computeItemMacros,
  sumMacros,
  macroGramsFromGoals,
  DEFAULT_GOALS,
  type NutritionGoals,
  type MacroTotals,
} from '../lib/nutrition';

type Food = Database['public']['Tables']['foods']['Row'];
type MealItemRow = Database['public']['Tables']['meal_items']['Row'];

export interface MealItemWithFood extends MealItemRow {
  food: Food | null;
}

export interface MealGroup {
  mealType: MealType;
  entryId: string | null;
  items: MealItemWithFood[];
  totals: MacroTotals;
}

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snacks',
};

export function useNutrition(dateISO: string) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [meals, setMeals] = useState<MealGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Objetivos del usuario (o defaults)
      const { data: goalRow } = await supabase
        .from('user_nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (goalRow) {
        setGoals({
          dailyCalories: goalRow.daily_calories,
          proteinPercentage: goalRow.protein_percentage,
          carbsPercentage: goalRow.carbs_percentage,
          fatPercentage: goalRow.fat_percentage,
        });
      } else {
        setGoals(DEFAULT_GOALS);
      }

      // Comidas del día con sus ítems y el alimento asociado
      const { data: entries, error } = await supabase
        .from('meal_entries')
        .select('id, meal_type, meal_items(*, food:foods(*))')
        .eq('user_id', user.id)
        .eq('date', dateISO);

      if (error) throw error;

      const byType = new Map<MealType, MealGroup>();
      for (const mealType of MEAL_ORDER) {
        byType.set(mealType, {
          mealType,
          entryId: null,
          items: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        });
      }

      for (const entry of entries ?? []) {
        const group = byType.get(entry.meal_type);
        if (!group) continue;
        group.entryId = entry.id;
        const items = (entry.meal_items ?? []) as unknown as MealItemWithFood[];
        group.items.push(...items);
      }

      for (const group of byType.values()) {
        group.totals = sumMacros(
          group.items.map((i) => ({
            calories: i.calories,
            protein: i.protein,
            carbs: i.carbs,
            fat: i.fat,
          }))
        );
      }

      setMeals(MEAL_ORDER.map((t) => byType.get(t)!));
    } catch (err) {
      console.error('Error cargando nutrición:', err);
    } finally {
      setLoading(false);
    }
  }, [user, dateISO]);

  useEffect(() => {
    load();
  }, [load]);

  /** Agrega un alimento a una comida del día (crea el meal_entry si no existe). */
  const addFood = useCallback(
    async (mealType: MealType, food: Food, quantity: number) => {
      if (!user) return;

      // Buscar o crear el meal_entry de (usuario, fecha, tipo)
      let entryId = meals.find((m) => m.mealType === mealType)?.entryId ?? null;

      if (!entryId) {
        const { data: created, error: entryErr } = await supabase
          .from('meal_entries')
          .insert({ user_id: user.id, date: dateISO, meal_type: mealType })
          .select('id')
          .single();
        if (entryErr) throw entryErr;
        entryId = created.id;
      }

      const macros = computeItemMacros(food, quantity);
      const { error: itemErr } = await supabase.from('meal_items').insert({
        meal_entry_id: entryId,
        food_id: food.id,
        quantity,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      });
      if (itemErr) throw itemErr;

      await load();
    },
    [user, dateISO, meals, load]
  );

  /** Elimina un ítem registrado. */
  const removeItem = useCallback(
    async (itemId: string) => {
      const { error } = await supabase.from('meal_items').delete().eq('id', itemId);
      if (error) throw error;
      await load();
    },
    [load]
  );

  /** Guarda (upsert) los objetivos de nutrición del usuario. */
  const saveGoals = useCallback(
    async (next: NutritionGoals) => {
      if (!user) return;
      const { error } = await supabase.from('user_nutrition_goals').upsert(
        {
          user_id: user.id,
          daily_calories: next.dailyCalories,
          protein_percentage: next.proteinPercentage,
          carbs_percentage: next.carbsPercentage,
          fat_percentage: next.fatPercentage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      setGoals(next);
    },
    [user]
  );

  const dayTotals = sumMacros(meals.map((m) => m.totals));
  const goalGrams = macroGramsFromGoals(goals);

  return {
    goals,
    goalGrams,
    meals,
    dayTotals,
    loading,
    addFood,
    removeItem,
    saveGoals,
    reload: load,
  };
}
