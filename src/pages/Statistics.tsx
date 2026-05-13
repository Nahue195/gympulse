import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Dumbbell, Calendar, Award, BarChart3, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components';
import type { Measure } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface WorkoutStats {
  totalWorkouts: number;
  thisMonthWorkouts: number;
  thisWeekWorkouts: number;
  currentStreak: number;
  totalSets: number;
}

interface WeeklyVolume {
  week: string;
  volume: number;
  workouts: number;
}

interface ExerciseFrequency {
  exerciseName: string;
  count: number;
}

interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxVolume: number;
  date: string;
}

export function Statistics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    thisMonthWorkouts: 0,
    thisWeekWorkouts: 0,
    currentStreak: 0,
    totalSets: 0
  });
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([]);
  const [topExercises, setTopExercises] = useState<ExerciseFrequency[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  async function loadStatistics() {
    try {
      setLoading(true);

      // Cargar workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (workoutsError) throw workoutsError;

      // Cargar workout entries para calcular volumen
      const { data: entries, error: entriesError } = await supabase
        .from('workout_entries')
        .select('*, workouts!inner(user_id, date)')
        .eq('workouts.user_id', user!.id);

      if (entriesError) throw entriesError;

      // Cargar mediciones de peso
      const { data: measuresData, error: measuresError } = await supabase
        .from('measures')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(10);

      if (measuresError) throw measuresError;

      if (measuresData) {
        const parsedMeasures = measuresData.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          date: m.date,
          heightCm: m.height_cm,
          weightKg: m.weight_kg,
          neckCm: m.neck_cm,
          chestCm: m.chest_cm,
          waistCm: m.waist_cm,
          hipCm: m.hip_cm,
          armCm: m.arm_cm,
          thighCm: m.thigh_cm,
          bodyFatPct: m.body_fat_pct,
          notes: m.notes,
          createdAt: m.created_at
        }));
        setMeasures(parsedMeasures);
      }

      if (workouts && entries) {
        calculateStats(workouts, entries);
        calculateWeeklyVolume(workouts, entries);
        calculateTopExercises(entries);
        calculatePersonalRecords(entries);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(workouts: any[], entries: any[]) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const thisMonthWorkouts = workouts.filter(w => new Date(w.date) >= startOfMonth).length;
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= startOfWeek).length;

    // Calcular racha actual (días consecutivos con entrenamiento)
    let currentStreak = 0;
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const uniqueDates = Array.from(new Set(sortedWorkouts.map(w => w.date))).sort().reverse();

    if (uniqueDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      // Si el último entrenamiento fue hoy o ayer, comenzar a contar
      const lastWorkoutDate = new Date(uniqueDates[0]);
      lastWorkoutDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        for (const dateStr of uniqueDates) {
          const workoutDate = new Date(dateStr);
          workoutDate.setHours(0, 0, 0, 0);

          if (workoutDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (workoutDate.getTime() < checkDate.getTime()) {
            break;
          }
        }
      }
    }

    // Calcular total de series completadas
    const totalSets = entries.reduce((sum, entry) => sum + (entry.sets || 0), 0);

    setStats({
      totalWorkouts: workouts.length,
      thisMonthWorkouts,
      thisWeekWorkouts,
      currentStreak,
      totalSets
    });
  }

  function calculateWeeklyVolume(workouts: any[], entries: any[]) {
    const volumeByWeek: { [key: string]: { volume: number; workouts: Set<string> } } = {};

    entries.forEach((entry: any) => {
      const workout = workouts.find(w => w.id === entry.workout_id);
      if (!workout) return;

      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!volumeByWeek[weekKey]) {
        volumeByWeek[weekKey] = { volume: 0, workouts: new Set() };
      }

      volumeByWeek[weekKey].workouts.add(entry.workout_id);

      if (entry.weight_per_set && entry.reps_per_set) {
        const weights = entry.weight_per_set.split(',').map(Number);
        const reps = entry.reps_per_set.split(',').map(Number);
        weights.forEach((weight: number, idx: number) => {
          volumeByWeek[weekKey].volume += weight * (reps[idx] || 0);
        });
      }
    });

    const weeklyData = Object.entries(volumeByWeek)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        volume: Math.round(data.volume),
        workouts: data.workouts.size
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8); // Últimas 8 semanas

    setWeeklyVolume(weeklyData);
  }

  function calculateTopExercises(entries: any[]) {
    const exerciseCount: { [key: string]: number } = {};

    entries.forEach(entry => {
      exerciseCount[entry.exercise_name] = (exerciseCount[entry.exercise_name] || 0) + 1;
    });

    const topExercises = Object.entries(exerciseCount)
      .map(([exerciseName, count]) => ({ exerciseName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTopExercises(topExercises);
  }

  function calculatePersonalRecords(entries: any[]) {
    const recordsByExercise: { [key: string]: PersonalRecord } = {};

    entries.forEach((entry: any) => {
      if (!entry.weight_per_set || !entry.reps_per_set) return;

      const weights = entry.weight_per_set.split(',').map(Number);
      const reps = entry.reps_per_set.split(',').map(Number);

      const maxWeight = Math.max(...weights);
      let totalVolume = 0;
      weights.forEach((weight: number, idx: number) => {
        totalVolume += weight * (reps[idx] || 0);
      });

      const existing = recordsByExercise[entry.exercise_name];
      if (!existing || maxWeight > existing.maxWeight) {
        recordsByExercise[entry.exercise_name] = {
          exerciseName: entry.exercise_name,
          maxWeight,
          maxVolume: totalVolume,
          date: entry.created_at
        };
      }
    });

    const records = Object.values(recordsByExercise)
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 5);

    setPersonalRecords(records);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
        <p className="text-slate-400 mt-1">Tu progreso y récords personales</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Entrenamientos Totales</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalWorkouts}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Dumbbell size={24} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Este Mes</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.thisMonthWorkouts}</p>
            </div>
            <div className="p-3 bg-emerald-600/20 rounded-lg">
              <Calendar size={24} className="text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Racha Actual</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.currentStreak}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.currentStreak === 1 ? 'día consecutivo' : 'días consecutivos'}</p>
            </div>
            <div className="p-3 bg-orange-600/20 rounded-lg">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Series Completadas</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalSets}</p>
              <p className="text-xs text-slate-500 mt-1">en total</p>
            </div>
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <BarChart3 size={24} className="text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Weight Stats */}
      {measures.length > 0 && (() => {
        const latestMeasure = measures[0];
        const previousMeasure = measures.length > 1 ? measures[1] : null;
        const weightChange = previousMeasure ? latestMeasure.weightKg - previousMeasure.weightKg : 0;

        return (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Scale size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Peso Corporal</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-white">{latestMeasure.weightKg}</p>
                      <span className="text-lg text-slate-400">kg</span>
                    </div>
                  </div>
                </div>
                {previousMeasure && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Última medición:</span>
                    <span className={`font-bold ${
                      weightChange > 0 ? 'text-orange-400' : weightChange < 0 ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                    </span>
                    {weightChange !== 0 && (
                      weightChange > 0 ? (
                        <TrendingUp size={16} className="text-orange-400" />
                      ) : (
                        <TrendingDown size={16} className="text-emerald-400" />
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Última actualización</p>
                <p className="text-sm text-slate-300">
                  {new Date(latestMeasure.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Weekly Frequency Chart */}
      {weeklyVolume.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Frecuencia de Entrenamientos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar
                dataKey="workouts"
                name="Entrenamientos"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Exercises */}
        {topExercises.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Ejercicios Más Realizados</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topExercises} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="exerciseName" type="category" stroke="#94a3b8" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" name="Veces realizado" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Award size={24} className="text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Récords Personales</h2>
            </div>
            <div className="space-y-3">
              {personalRecords.map((record, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div>
                    <h3 className="font-bold text-white">{record.exerciseName}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(record.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">{record.maxWeight} kg</p>
                    <p className="text-xs text-slate-500">Peso máximo</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {stats.totalWorkouts === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp size={48} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No hay datos todavía</h3>
            <p className="text-slate-400">
              Completa algunos entrenamientos para ver tus estadísticas
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
