import { useState, useEffect, useCallback } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { computeItemMacros } from '../lib/nutrition';
import { MEAL_LABELS } from '../hooks/useNutrition';
import type { Database, MealType } from '../types/database';

type Food = Database['public']['Tables']['foods']['Row'];

interface Props {
  mealType: MealType;
  onClose: () => void;
  onAdd: (mealType: MealType, food: Food, quantity: number) => Promise<void>;
}

export function AddFoodModal({ mealType, onClose, onAdd }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('foods').select('*').order('name').limit(40);
      if (query.trim()) q = q.ilike('name', `%${query.trim()}%`);
      // Alimentos del sistema + los propios del usuario
      if (user) q = q.or(`is_custom.eq.false,user_id.eq.${user.id}`);
      const { data, error } = await q;
      if (error) throw error;
      setFoods(data ?? []);
    } catch (err) {
      console.error('Error buscando alimentos:', err);
    } finally {
      setLoading(false);
    }
  }, [query, user]);

  useEffect(() => {
    const t = setTimeout(search, 250);
    return () => clearTimeout(t);
  }, [search]);

  const qtyNum = parseFloat(quantity) || 0;
  const preview = selected ? computeItemMacros(selected, qtyNum) : null;

  async function handleAdd() {
    if (!selected || qtyNum <= 0) return;
    try {
      setSaving(true);
      await onAdd(mealType, selected, qtyNum);
      onClose();
    } catch (err) {
      console.error('Error agregando alimento:', err);
      alert('No se pudo agregar el alimento');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-[10px] font-condensed font-600 tracking-widest uppercase" style={{ color: 'var(--ink-3)' }}>
              Agregar a
            </p>
            <h2 className="font-display text-lg leading-none" style={{ color: 'var(--ink)' }}>
              {MEAL_LABELS[mealType]}
            </h2>
          </div>
          <button onClick={onClose} className="p-2" style={{ color: 'var(--ink-2)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'var(--base)', borderRadius: '2px' }}>
            <Search size={16} style={{ color: 'var(--ink-3)' }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alimento…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* Food list */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{ minHeight: '120px' }}>
          {loading ? (
            <p className="text-center text-sm py-6" style={{ color: 'var(--ink-3)' }}>Buscando…</p>
          ) : foods.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: 'var(--ink-3)' }}>Sin resultados</p>
          ) : (
            foods.map((food) => {
              const isSel = selected?.id === food.id;
              return (
                <button
                  key={food.id}
                  onClick={() => setSelected(food)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors"
                  style={{
                    borderRadius: '2px',
                    background: isSel ? 'var(--acid-dim)' : 'transparent',
                    borderLeft: isSel ? '2px solid var(--acid)' : '2px solid transparent',
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-500 truncate" style={{ color: 'var(--ink)' }}>{food.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                      {food.calories} kcal · {food.protein}P {food.carbs}C {food.fat}G · {food.serving_size}{food.serving_unit}
                    </p>
                  </div>
                  {isSel && <span className="text-[10px] font-700 uppercase tracking-wide" style={{ color: 'var(--acid)' }}>✓</span>}
                </button>
              );
            })
          )}
        </div>

        {/* Selected + quantity + preview */}
        {selected && (
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <label className="text-xs font-condensed font-600 tracking-wide uppercase" style={{ color: 'var(--ink-2)' }}>
                Porciones
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 px-2 py-1.5 text-sm outline-none"
                style={{ background: 'var(--base)', color: 'var(--ink)', borderRadius: '2px', border: '1px solid var(--border)' }}
              />
              <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                × {selected.serving_size}{selected.serving_unit}
              </span>
            </div>
            {preview && (
              <div className="flex gap-4 text-xs" style={{ color: 'var(--ink-2)' }}>
                <span><strong style={{ color: 'var(--ink)' }}>{preview.calories}</strong> kcal</span>
                <span><strong style={{ color: 'var(--ink)' }}>{preview.protein}</strong>g P</span>
                <span><strong style={{ color: 'var(--ink)' }}>{preview.carbs}</strong>g C</span>
                <span><strong style={{ color: 'var(--ink)' }}>{preview.fat}</strong>g G</span>
              </div>
            )}
            <button
              onClick={handleAdd}
              disabled={saving || qtyNum <= 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 font-condensed font-700 text-xs tracking-widest uppercase transition-all disabled:opacity-50"
              style={{ background: 'var(--acid)', color: '#000', borderRadius: '2px' }}
            >
              <Plus size={14} />
              {saving ? 'Agregando…' : 'Agregar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
