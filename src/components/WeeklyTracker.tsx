import { useMemo } from 'react';
import { format, startOfWeek, addDays, isToday, isFuture, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyTrackerProps {
  workoutDates: string[];
  trainingDays?: number[]; // 1=Lunes, 2=Martes, ..., 6=Sábado
}

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S'];

export function WeeklyTracker({ workoutDates, trainingDays = [1, 3, 5] }: WeeklyTrackerProps) {
  const weekData = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
    const workoutSet = new Set(workoutDates.map(d => d.split('T')[0]));

    const days = [];
    let workoutCount = 0;

    // Solo Lunes a Sábado (6 días, sin domingo)
    for (let i = 0; i < 6; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasWorkout = workoutSet.has(dateStr);
      const isTodayDate = isToday(date);
      const isFutureDate = isFuture(date);
      const dayNumber = i + 1; // 1=Lunes, 2=Martes, etc.
      const isTrainingDay = trainingDays.includes(dayNumber);

      if (hasWorkout) workoutCount++;

      days.push({
        date,
        dateStr,
        dayName: DAY_NAMES[i],
        dayNumber: format(date, 'd'),
        dayId: dayNumber,
        hasWorkout,
        isToday: isTodayDate,
        isFuture: isFutureDate,
        isTrainingDay,
      });
    }

    return { days, workoutCount };
  }, [workoutDates, trainingDays]);

  const { days } = weekData;

  // Calcular estado de cada día
  const daysWithStatus = useMemo(() => {
    return days.map(day => {
      let status: 'completed' | 'rest' | 'missed' | 'today' | 'pending';

      if (day.hasWorkout) {
        status = 'completed';
      } else if (!day.isTrainingDay) {
        // No es día de entrenamiento = descanso
        status = 'rest';
      } else if (day.isFuture) {
        // Día de entrenamiento futuro
        status = 'pending';
      } else if (day.isToday) {
        // Hoy y es día de entrenamiento
        status = 'today';
      } else {
        // Día de entrenamiento pasado sin workout
        status = 'missed';
      }

      return { ...day, status };
    });
  }, [days]);

  const trainingDaysThisWeek = trainingDays.filter(d => d <= 6).length;
  const completedDays = daysWithStatus.filter(d => d.status === 'completed').length;

  return (
    <div className="bg-slate-800 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">Esta semana</h3>
          <p className="text-xs text-slate-400">{completedDays}/{trainingDaysThisWeek} días</p>
        </div>
        {completedDays >= trainingDaysThisWeek && trainingDaysThisWeek > 0 && (
          <span className="text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-500/20 rounded-full">
            ✓ Completado
          </span>
        )}
      </div>

      {/* Días de la semana (sin domingo) */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {daysWithStatus.map((day) => {
          let bgColor = 'bg-slate-700';
          let textColor = 'text-slate-400';
          let ringClass = '';

          switch (day.status) {
            case 'completed':
              bgColor = 'bg-emerald-500';
              textColor = 'text-white';
              break;
            case 'rest':
              bgColor = 'bg-slate-700/50';
              textColor = 'text-slate-500';
              break;
            case 'missed':
              bgColor = 'bg-red-500/70';
              textColor = 'text-white';
              break;
            case 'today':
              bgColor = 'bg-blue-500';
              textColor = 'text-white';
              ringClass = 'ring-2 ring-blue-400';
              break;
            case 'pending':
              bgColor = 'bg-slate-600';
              textColor = 'text-slate-300';
              break;
          }

          const statusText = {
            completed: '✓ Entrenaste',
            rest: 'Descanso',
            missed: 'Faltaste',
            today: 'Hoy - Te toca entrenar',
            pending: 'Pendiente',
          };

          return (
            <div
              key={day.dateStr}
              className={`flex flex-col items-center p-1.5 sm:p-2 rounded-lg ${bgColor} ${ringClass} transition-all`}
              title={`${format(day.date, "EEEE d 'de' MMMM", { locale: es })} - ${statusText[day.status]}`}
            >
              <span className={`text-[10px] sm:text-xs font-bold ${textColor}`}>
                {day.dayName}
              </span>
              <span className={`text-sm sm:text-base font-bold ${textColor}`}>
                {day.dayNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Leyenda compacta */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span>Fui</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-slate-700/50" />
          <span>Descanso</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-red-500/70" />
          <span>Falté</span>
        </div>
      </div>
    </div>
  );
}
