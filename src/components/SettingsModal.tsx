import { useState } from 'react';
import { X, Timer, Save, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface SettingsModalProps {
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lun' },
  { id: 2, name: 'Mar' },
  { id: 3, name: 'Mié' },
  { id: 4, name: 'Jue' },
  { id: 5, name: 'Vie' },
  { id: 6, name: 'Sáb' },
];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, updateProfile } = useAuth();
  const [restTimerSeconds, setRestTimerSeconds] = useState(user?.restTimerSeconds ?? 90);
  const [trainingDays, setTrainingDays] = useState<number[]>(user?.trainingDays ?? [1, 3, 5]);
  const [saving, setSaving] = useState(false);

  const presetTimes = [30, 60, 90, 120, 180];

  function toggleDay(dayId: number) {
    setTrainingDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort((a, b) => a - b)
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateProfile({ restTimerSeconds, trainingDays });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Configuracion</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Training Days Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Calendar size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Días de entrenamiento</h3>
                <p className="text-sm text-slate-400">Seleccioná qué días entrenás</p>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`p-2 sm:p-3 rounded-lg font-bold text-sm transition-all ${
                    trainingDays.includes(day.id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center">
              {trainingDays.length} días por semana
            </p>
          </div>

          {/* Rest Timer Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Timer size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Tiempo de descanso</h3>
                <p className="text-sm text-slate-400">Duracion del temporizador entre series</p>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
              {presetTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setRestTimerSeconds(time)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    restTimerSeconds === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {time}s
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={600}
                value={restTimerSeconds}
                onChange={(e) => setRestTimerSeconds(Math.max(10, Math.min(600, parseInt(e.target.value) || 90)))}
                className="w-24 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400">segundos</span>
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Vista previa</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} loading={saving}>
            <Save size={18} />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
