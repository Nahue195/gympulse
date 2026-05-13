import { X, Copy, User } from 'lucide-react';
import type { RoutineWithDays } from '../types';
import { Button } from './Button';

interface RoutineDetailModalProps {
  routine: RoutineWithDays;
  onClose: () => void;
  onClone?: () => void;
  isOwnRoutine?: boolean;
}

export function RoutineDetailModal({ routine, onClose, onClone, isOwnRoutine }: RoutineDetailModalProps) {
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
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{routine.routineName}</h2>
            {routine.user && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <User size={14} />
                <span>por {routine.user.displayName}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{routine.totalDays}</p>
              <p className="text-xs text-slate-400">dias</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{routine.totalExercises}</p>
              <p className="text-xs text-slate-400">ejercicios</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{routine.cloneCount ?? 0}</p>
              <p className="text-xs text-slate-400">copias</p>
            </div>
          </div>

          {/* Description */}
          {routine.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Descripcion
              </h3>
              <p className="text-white">{routine.description}</p>
            </div>
          )}

          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
              {routine.workoutType}
            </span>
            {routine.visibility === 'PUBLIC' && (
              <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium">
                Publica
              </span>
            )}
          </div>

          {/* Days */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Dias de la rutina
            </h3>
            <div className="space-y-4">
              {routine.days.map((day) => (
                <div key={day.id} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold">
                          {day.dayNumber}
                        </span>
                        <h4 className="font-semibold text-white">{day.dayName}</h4>
                      </div>
                      <span className="text-sm text-slate-400">
                        {day.exercises.length} ejercicios
                      </span>
                    </div>
                  </div>

                  {day.exercises.length > 0 && (
                    <div className="divide-y divide-slate-700">
                      {day.exercises.map((exercise, idx) => (
                        <div key={exercise.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 w-6">{idx + 1}.</span>
                            <span className="text-white">{exercise.exerciseName}</span>
                          </div>
                          <span className="text-sm text-slate-400">
                            {exercise.sets} × {exercise.reps}
                            {exercise.weightKg && ` @ ${exercise.weightKg}kg`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cerrar
          </Button>
          {!isOwnRoutine && onClone && (
            <Button fullWidth onClick={onClone}>
              <Copy size={18} />
              Copiar rutina
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
