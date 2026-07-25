import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Target, Trash2, UtensilsCrossed } from 'lucide-react';
import { useNutrition, MEAL_LABELS } from '../hooks/useNutrition';
import { progressPct } from '../lib/nutrition';
import { AddFoodModal } from '../components/AddFoodModal';
import { NutritionGoalsModal } from '../components/NutritionGoalsModal';
import type { MealType } from '../types/database';

function MacroBar({ label, consumed, goal, unit }: { label: string; consumed: number; goal: number; unit: string }) {
  const pct = progressPct(consumed, goal);
  const over = consumed > goal && goal > 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-condensed font-600 tracking-widest uppercase" style={{ color: 'var(--ink-3)' }}>
          {label}
        </span>
        <span className="text-[11px] font-500" style={{ color: over ? 'var(--fire)' : 'var(--ink-2)' }}>
          {Math.round(consumed)}<span style={{ color: 'var(--ink-3)' }}> / {goal}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden" style={{ background: 'var(--base)', borderRadius: '2px' }}>
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: over ? 'var(--fire)' : 'var(--acid)' }} />
      </div>
    </div>
  );
}

export function Nutricion() {
  const [date, setDate] = useState(new Date());
  const dateISO = format(date, 'yyyy-MM-dd');
  const { goals, goalGrams, meals, dayTotals, loading, addFood, removeItem, saveGoals } = useNutrition(dateISO);

  const [addingTo, setAddingTo] = useState<MealType | null>(null);
  const [editingGoals, setEditingGoals] = useState(false);

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateISO;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header con navegación de fecha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl leading-none" style={{ color: 'var(--ink)' }}>NUTRICIÓN</h1>
          <p className="text-xs font-condensed tracking-wide mt-1" style={{ color: 'var(--ink-3)' }}>
            {isToday ? 'Hoy · ' : ''}{format(date, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <button
          onClick={() => setEditingGoals(true)}
          className="flex items-center gap-2 px-3 py-2 font-condensed font-600 text-xs tracking-wide uppercase transition-all"
          style={{ background: 'var(--surface)', color: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: '2px' }}
        >
          <Target size={14} />
          <span className="hidden sm:inline">Objetivos</span>
        </button>
      </div>

      {/* Date nav */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setDate((d) => subDays(d, 1))} className="p-1.5" style={{ color: 'var(--ink-2)' }}>
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-condensed font-600 tracking-widest uppercase" style={{ color: 'var(--ink-2)' }}>
          {format(date, 'dd/MM/yyyy')}
        </span>
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          disabled={isToday}
          className="p-1.5 disabled:opacity-30"
          style={{ color: 'var(--ink-2)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Resumen de macros */}
      <div className="p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-condensed font-600 tracking-widest uppercase" style={{ color: 'var(--ink-3)' }}>
            Calorías
          </span>
          <span className="font-display text-xl leading-none" style={{ color: 'var(--ink)' }}>
            {Math.round(dayTotals.calories)}
            <span className="text-sm" style={{ color: 'var(--ink-3)' }}> / {goals.dailyCalories} kcal</span>
          </span>
        </div>
        <MacroBar label="Calorías" consumed={dayTotals.calories} goal={goalGrams.calories} unit=" kcal" />
        <div className="grid grid-cols-3 gap-3 pt-1">
          <MacroBar label="Proteína" consumed={dayTotals.protein} goal={goalGrams.protein} unit="g" />
          <MacroBar label="Carbos" consumed={dayTotals.carbs} goal={goalGrams.carbs} unit="g" />
          <MacroBar label="Grasas" consumed={dayTotals.fat} goal={goalGrams.fat} unit="g" />
        </div>
      </div>

      {/* Comidas */}
      {loading ? (
        <p className="text-center text-sm py-8" style={{ color: 'var(--ink-3)' }}>Cargando…</p>
      ) : (
        meals.map((meal) => (
          <div key={meal.mealType} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: meal.items.length ? '1px solid var(--border)' : 'none' }}>
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={15} style={{ color: 'var(--ink-3)' }} />
                <span className="font-condensed font-700 text-sm tracking-wide uppercase" style={{ color: 'var(--ink)' }}>
                  {MEAL_LABELS[meal.mealType]}
                </span>
                {meal.totals.calories > 0 && (
                  <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>· {Math.round(meal.totals.calories)} kcal</span>
                )}
              </div>
              <button
                onClick={() => setAddingTo(meal.mealType)}
                className="flex items-center gap-1 px-2 py-1 font-condensed font-600 text-[11px] tracking-wide uppercase transition-all"
                style={{ background: 'var(--acid-dim)', color: 'var(--acid)', borderRadius: '2px' }}
              >
                <Plus size={13} /> Agregar
              </button>
            </div>

            {meal.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-500 truncate" style={{ color: 'var(--ink)' }}>
                    {item.food?.name ?? 'Alimento'} <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>×{item.quantity}</span>
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                    {Math.round(item.calories)} kcal · {item.protein}P {item.carbs}C {item.fat}G
                  </p>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1.5 ml-2 flex-shrink-0" style={{ color: 'var(--ink-3)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      {addingTo && (
        <AddFoodModal mealType={addingTo} onClose={() => setAddingTo(null)} onAdd={addFood} />
      )}
      {editingGoals && (
        <NutritionGoalsModal goals={goals} onClose={() => setEditingGoals(false)} onSave={saveGoals} />
      )}
    </div>
  );
}
