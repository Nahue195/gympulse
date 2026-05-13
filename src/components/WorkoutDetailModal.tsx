import { useState, useEffect } from 'react';
import { X, Calendar, Dumbbell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Workout, WorkoutEntry } from '../types';
import { Button } from './Button';

interface WorkoutDetailModalProps {
  workout: Workout;
  onClose: () => void;
}

interface WorkoutEntryWithDetails extends WorkoutEntry {
  weights: number[];
  repsArray: number[];
}

export function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  const [entries, setEntries] = useState<WorkoutEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutEntries();
  }, [workout.id]);

  async function loadWorkoutEntries() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_entries')
        .select('*')
        .eq('workout_id', workout.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const entriesWithDetails = data.map((entry: any) => ({
          id: entry.id,
          workoutId: entry.workout_id,
          exerciseId: entry.exercise_id,
          exerciseName: entry.exercise_name,
          sets: entry.sets,
          repsPerSet: entry.reps_per_set,
          weightPerSet: entry.weight_per_set,
          unit: entry.unit,
          rpe: entry.rpe,
          createdAt: entry.created_at,
          weights: entry.weight_per_set ? entry.weight_per_set.split(',').map(Number) : [],
          repsArray: entry.reps_per_set ? entry.reps_per_set.split(',').map(Number) : []
        }));
        setEntries(entriesWithDetails);
      }
    } catch (error) {
      console.error('Error loading workout entries:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalVolume = entries.reduce((sum, entry) => {
    return sum + entry.weights.reduce((setSum, weight, idx) => {
      return setSum + (weight * (entry.repsArray[idx] || 0));
    }, 0);
  }, 0);

  const totalSets = entries.reduce((sum, entry) => sum + entry.sets, 0);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">{workout.routineName}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(workout.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{workout.durationMinutes || '-'}</p>
            <p className="text-xs text-slate-400">minutos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{entries.length}</p>
            <p className="text-xs text-slate-400">ejercicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalSets}</p>
            <p className="text-xs text-slate-400">series</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{Math.round(totalVolume)}</p>
            <p className="text-xs text-slate-400">kg total</p>
          </div>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Dumbbell size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400">No hay ejercicios registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Ejercicios realizados
              </h3>
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{entry.exerciseName}</h4>
                      <p className="text-sm text-slate-400">
                        {entry.sets} series
                      </p>
                    </div>
                  </div>

                  {/* Sets Detail */}
                  <div className="space-y-2">
                    {entry.weights.map((weight, setIdx) => (
                      <div
                        key={setIdx}
                        className="flex items-center gap-3 py-2 px-3 bg-slate-800 rounded-lg"
                      >
                        <span className="text-sm text-slate-500 w-16">
                          Serie {setIdx + 1}
                        </span>
                        <span className="text-white font-medium">
                          {weight}kg × {entry.repsArray[setIdx] || 0}
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          {Math.round(weight * (entry.repsArray[setIdx] || 0))} kg vol
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {workout.notes && (
            <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Notas
              </h3>
              <p className="text-white whitespace-pre-wrap">{workout.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
