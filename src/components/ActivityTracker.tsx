import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isFuture, startOfDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityTrackerProps {
  workoutDates: string[];
  trainingDays?: number[]; // 1=Lunes, 2=Martes, ..., 6=Sábado
}

export function ActivityTracker({ workoutDates, trainingDays = [1, 3, 5] }: ActivityTrackerProps) {
  const monthData = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const workoutSet = new Set(workoutDates.map(d => d.split('T')[0]));

    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const days = allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasWorkout = workoutSet.has(dateStr);
      const isTodayDate = isToday(date);
      const isFutureDate = isFuture(date);

      // getDay() devuelve 0=Domingo, 1=Lunes, etc.
      // Convertimos a nuestro sistema: 1=Lunes, ..., 6=Sábado, 7=Domingo
      const jsDay = getDay(date);
      const dayId = jsDay === 0 ? 7 : jsDay; // Domingo = 7
      const isTrainingDay = trainingDays.includes(dayId);

      return {
        date,
        dateStr,
        dayNumber: format(date, 'd'),
        hasWorkout,
        isToday: isTodayDate,
        isFuture: isFutureDate,
        isTrainingDay,
        dayId,
      };
    });

    return days;
  }, [workoutDates, trainingDays]);

  // Calcular estado de cada día
  const daysWithStatus = useMemo(() => {
    return monthData.map(day => {
      let status: 'completed' | 'rest' | 'missed' | 'today' | 'future';

      if (day.hasWorkout) {
        status = 'completed';
      } else if (!day.isTrainingDay) {
        status = 'rest';
      } else if (day.isFuture) {
        status = 'future';
      } else if (day.isToday) {
        status = 'today';
      } else {
        status = 'missed';
      }

      return { ...day, status };
    });
  }, [monthData]);

  const totalWorkouts = daysWithStatus.filter(d => d.status === 'completed').length;
  const missedDays = daysWithStatus.filter(d => d.status === 'missed').length;
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });

  // Calcular día de la semana del primer día del mes (para el offset del grid)
  const firstDayOfMonth = monthData[0]?.date;
  const firstDayOffset = firstDayOfMonth ? (getDay(firstDayOfMonth) === 0 ? 6 : getDay(firstDayOfMonth) - 1) : 0;

  return (
    <div className="bg-slate-800 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white capitalize">{currentMonth}</h3>
          <p className="text-xs text-slate-400">{trainingDays.length} días/semana</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-center">
            <span className="block text-lg font-bold text-emerald-400">{totalWorkouts}</span>
            <span className="text-slate-400">fui</span>
          </div>
          {missedDays > 0 && (
            <div className="text-center">
              <span className="block text-lg font-bold text-red-400">{missedDays}</span>
              <span className="text-slate-400">falté</span>
            </div>
          )}
        </div>
      </div>

      {/* Header de días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
          <div key={day} className="text-center text-[10px] text-slate-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Grid del mes */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espacios vacíos antes del primer día */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square" />
        ))}

        {/* Días del mes */}
        {daysWithStatus.map((day) => {
          let bgColor = 'bg-slate-700/30';
          let textColor = 'text-slate-500';
          let ringClass = '';

          switch (day.status) {
            case 'completed':
              bgColor = 'bg-emerald-500';
              textColor = 'text-white';
              break;
            case 'rest':
              bgColor = 'bg-slate-700/30';
              textColor = 'text-slate-600';
              break;
            case 'missed':
              bgColor = 'bg-red-500/60';
              textColor = 'text-white';
              break;
            case 'today':
              bgColor = 'bg-blue-500';
              textColor = 'text-white';
              ringClass = 'ring-2 ring-blue-400';
              break;
            case 'future':
              bgColor = day.isTrainingDay ? 'bg-slate-600/50' : 'bg-slate-700/20';
              textColor = day.isTrainingDay ? 'text-slate-400' : 'text-slate-600';
              break;
          }

          const statusText = {
            completed: '✓ Entrenaste',
            rest: 'Descanso',
            missed: 'Faltaste',
            today: day.isTrainingDay ? 'Hoy - Te toca' : 'Hoy - Descanso',
            future: day.isTrainingDay ? 'Pendiente' : 'Descanso',
          };

          return (
            <div
              key={day.dateStr}
              className={`w-full aspect-square flex items-center justify-center rounded-md ${bgColor} ${ringClass} transition-all text-xs sm:text-sm font-medium ${textColor}`}
              title={`${format(day.date, "EEEE d", { locale: es })} - ${statusText[day.status]}`}
            >
              {day.dayNumber}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 text-[10px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Fui</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/60" />
          <span>Falté</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-700/30" />
          <span>Descanso</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
