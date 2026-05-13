import { Copy, Dumbbell } from 'lucide-react';
import type { RoutineWithDays } from '../types';
import { Card } from './Card';

interface RoutineCardProps {
  routine: RoutineWithDays;
  onClick?: () => void;
  showUser?: boolean;
}

export function RoutineCard({ routine, onClick, showUser = false }: RoutineCardProps) {
  return (
    <Card
      className="hover:border-blue-500 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{routine.routineName}</h3>
            {showUser && routine.user && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white text-xs overflow-hidden">
                  {routine.user.avatarUrl ? (
                    <img src={routine.user.avatarUrl} alt={routine.user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    routine.user.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <span>{routine.user.displayName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
              {routine.workoutType}
            </span>
          </div>
        </div>

        {/* Description */}
        {routine.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{routine.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Dumbbell size={14} />
            {routine.totalDays} dias
          </span>
          <span>•</span>
          <span>{routine.totalExercises} ejercicios</span>
          {(routine.cloneCount ?? 0) > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Copy size={14} />
                {routine.cloneCount} copias
              </span>
            </>
          )}
        </div>

        {/* Days preview */}
        <div className="flex flex-wrap gap-2">
          {routine.days.slice(0, 5).map((day) => (
            <span
              key={day.id}
              className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
            >
              {day.dayName}
            </span>
          ))}
          {routine.days.length > 5 && (
            <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
              +{routine.days.length - 5} mas
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
