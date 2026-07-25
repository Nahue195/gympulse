import { useState } from 'react';
import { X } from 'lucide-react';
import { macroGramsFromGoals, type NutritionGoals } from '../lib/nutrition';

interface Props {
  goals: NutritionGoals;
  onClose: () => void;
  onSave: (goals: NutritionGoals) => Promise<void>;
}

export function NutritionGoalsModal({ goals, onClose, onSave }: Props) {
  const [calories, setCalories] = useState(String(goals.dailyCalories));
  const [protein, setProtein] = useState(String(goals.proteinPercentage));
  const [carbs, setCarbs] = useState(String(goals.carbsPercentage));
  const [fat, setFat] = useState(String(goals.fatPercentage));
  const [saving, setSaving] = useState(false);

  const p = parseInt(protein) || 0;
  const c = parseInt(carbs) || 0;
  const f = parseInt(fat) || 0;
  const sum = p + c + f;
  const valid = sum === 100 && (parseInt(calories) || 0) > 0;

  const preview = valid
    ? macroGramsFromGoals({
        dailyCalories: parseInt(calories),
        proteinPercentage: p,
        carbsPercentage: c,
        fatPercentage: f,
      })
    : null;

  async function handleSave() {
    if (!valid) return;
    try {
      setSaving(true);
      await onSave({
        dailyCalories: parseInt(calories),
        proteinPercentage: p,
        carbsPercentage: c,
        fatPercentage: f,
      });
      onClose();
    } catch (err) {
      console.error('Error guardando objetivos:', err);
      alert('No se pudieron guardar los objetivos');
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    value: string,
    setter: (v: string) => void,
    suffix: string
  ) => (
    <div className="flex items-center justify-between">
      <label className="text-xs font-condensed font-600 tracking-wide uppercase" style={{ color: 'var(--ink-2)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="w-24 px-2 py-1.5 text-sm outline-none text-right"
          style={{ background: 'var(--base)', color: 'var(--ink)', borderRadius: '2px', border: '1px solid var(--border)' }}
        />
        <span className="text-[11px] w-8" style={{ color: 'var(--ink-3)' }}>{suffix}</span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display text-lg leading-none" style={{ color: 'var(--ink)' }}>Objetivos diarios</h2>
          <button onClick={onClose} className="p-2" style={{ color: 'var(--ink-2)' }}><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          {field('Calorías', calories, setCalories, 'kcal')}
          {field('Proteína', protein, setProtein, '%')}
          {field('Carbos', carbs, setCarbs, '%')}
          {field('Grasas', fat, setFat, '%')}

          <div
            className="flex items-center justify-between px-3 py-2 text-xs"
            style={{
              background: sum === 100 ? 'var(--acid-dim)' : 'rgba(239,68,68,0.12)',
              borderRadius: '2px',
              color: sum === 100 ? 'var(--ink)' : '#f87171',
            }}
          >
            <span className="font-condensed font-600 tracking-wide uppercase">Suma de macros</span>
            <span className="font-700">{sum}% {sum !== 100 && '(debe ser 100%)'}</span>
          </div>

          {preview && (
            <div className="flex gap-4 text-xs justify-center pt-1" style={{ color: 'var(--ink-2)' }}>
              <span><strong style={{ color: 'var(--ink)' }}>{preview.protein}</strong>g P</span>
              <span><strong style={{ color: 'var(--ink)' }}>{preview.carbs}</strong>g C</span>
              <span><strong style={{ color: 'var(--ink)' }}>{preview.fat}</strong>g G</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!valid || saving}
            className="w-full py-2.5 font-condensed font-700 text-xs tracking-widest uppercase transition-all disabled:opacity-50"
            style={{ background: 'var(--acid)', color: '#000', borderRadius: '2px' }}
          >
            {saving ? 'Guardando…' : 'Guardar objetivos'}
          </button>
        </div>
      </div>
    </div>
  );
}
