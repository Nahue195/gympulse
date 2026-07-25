import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from './';

interface AddMeasureModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddMeasureModal({ onClose, onAdded }: AddMeasureModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    heightCm: '',
    neckCm: '',
    chestCm: '',
    waistCm: '',
    hipCm: '',
    armCm: '',
    thighCm: '',
    bodyFatPct: '',
    notes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.weightKg) {
      alert('El peso es obligatorio');
      return;
    }

    try {
      setLoading(true);

      const { error } = await (supabase.from('measures')).insert({
        user_id: user!.id,
        date: formData.date,
        weight_kg: parseFloat(formData.weightKg),
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        neck_cm: formData.neckCm ? parseFloat(formData.neckCm) : null,
        chest_cm: formData.chestCm ? parseFloat(formData.chestCm) : null,
        waist_cm: formData.waistCm ? parseFloat(formData.waistCm) : null,
        hip_cm: formData.hipCm ? parseFloat(formData.hipCm) : null,
        arm_cm: formData.armCm ? parseFloat(formData.armCm) : null,
        thigh_cm: formData.thighCm ? parseFloat(formData.thighCm) : null,
        body_fat_pct: formData.bodyFatPct ? parseFloat(formData.bodyFatPct) : null,
        notes: formData.notes || null
      });

      if (error) throw error;

      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding measure:', error);
      alert('Error al guardar las mediciones');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Agregar Mediciones</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Fecha *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Peso y Altura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Peso (kg) *
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Altura (cm)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="175"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
              />
            </div>
          </div>

          {/* Medidas Corporales */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Medidas Corporales (cm)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Cuello</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="38.0"
                  value={formData.neckCm}
                  onChange={(e) => setFormData({ ...formData, neckCm: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Pecho</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="100.0"
                  value={formData.chestCm}
                  onChange={(e) => setFormData({ ...formData, chestCm: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Cintura</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="85.0"
                  value={formData.waistCm}
                  onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Cadera</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="95.0"
                  value={formData.hipCm}
                  onChange={(e) => setFormData({ ...formData, hipCm: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Brazo</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="35.0"
                  value={formData.armCm}
                  onChange={(e) => setFormData({ ...formData, armCm: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Muslo</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="55.0"
                  value={formData.thighCm}
                  onChange={(e) => setFormData({ ...formData, thighCm: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Grasa Corporal */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Grasa Corporal (%)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="15.0"
              value={formData.bodyFatPct}
              onChange={(e) => setFormData({ ...formData, bodyFatPct: e.target.value })}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Notas
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
              rows={3}
              placeholder="Observaciones sobre tu progreso..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Mediciones'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
