import { describe, it, expect } from 'vitest';
import {
  macroGramsFromGoals,
  computeItemMacros,
  sumMacros,
  progressPct,
  DEFAULT_GOALS,
} from './nutrition';

describe('macroGramsFromGoals', () => {
  it('convierte 2000 kcal 30/40/30 en gramos por macro', () => {
    const g = macroGramsFromGoals(DEFAULT_GOALS);
    expect(g.calories).toBe(2000);
    expect(g.protein).toBe(150); // 600 kcal / 4
    expect(g.carbs).toBe(200); // 800 kcal / 4
    expect(g.fat).toBe(67); // 600 kcal / 9 ≈ 66.7 → 67
  });

  it('escala con las calorías', () => {
    const g = macroGramsFromGoals({ ...DEFAULT_GOALS, dailyCalories: 3000 });
    expect(g.protein).toBe(225);
  });
});

describe('computeItemMacros', () => {
  const pollo = { calories: 165, protein: 31, carbs: 0, fat: 3.6 };

  it('multiplica por la cantidad de porciones', () => {
    expect(computeItemMacros(pollo, 2)).toEqual({
      calories: 330,
      protein: 62,
      carbs: 0,
      fat: 7.2,
    });
  });

  it('redondea a 1 decimal', () => {
    const r = computeItemMacros({ calories: 100, protein: 3.33, carbs: 0, fat: 0 }, 3);
    expect(r.protein).toBe(10); // 9.99 → 10
  });

  it('cantidad inválida o negativa da 0', () => {
    expect(computeItemMacros(pollo, -1)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    expect(computeItemMacros(pollo, NaN)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('sumMacros', () => {
  it('suma varios ítems', () => {
    const total = sumMacros([
      { calories: 100, protein: 10, carbs: 5, fat: 2 },
      { calories: 200, protein: 20, carbs: 10, fat: 4 },
    ]);
    expect(total).toEqual({ calories: 300, protein: 30, carbs: 15, fat: 6 });
  });

  it('lista vacía da todo en 0', () => {
    expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('progressPct', () => {
  it('calcula el porcentaje', () => {
    expect(progressPct(50, 200)).toBe(25);
  });
  it('acota a 100 cuando se pasa', () => {
    expect(progressPct(300, 200)).toBe(100);
  });
  it('objetivo 0 da 0 sin dividir por cero', () => {
    expect(progressPct(50, 0)).toBe(0);
  });
});
