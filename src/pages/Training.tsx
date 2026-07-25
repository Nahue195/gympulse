import { useState, useEffect } from 'react';
import { Play, Zap, Calendar, Clock, TrendingUp, ChevronRight, History } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { RoutineWithDays, WorkoutSession, WorkoutSessionExercise, Workout } from '../types';
import { Button, Card, WorkoutSessionComponent, WeeklyTracker } from '../components';
import { WorkoutDetailModal } from '../components/WorkoutDetailModal';

const DRAFT_SESSION_KEY = 'gympulse_workout_draft';

export function Training() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [routines, setRoutines] = useState<RoutineWithDays[]>([]);
  const [showRoutineSelect, setShowRoutineSelect] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineWithDays | null>(null);
  const [_saving, setSaving] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftSession, setDraftSession] = useState<WorkoutSession | null>(null);

  // Cargar borrador al iniciar
  useEffect(() => {
    if (user && !activeSession) {
      const saved = localStorage.getItem(DRAFT_SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Restaurar el startTime como Date
          parsed.startTime = new Date(parsed.startTime);
          setDraftSession(parsed);
          setShowDraftModal(true);
        } catch (e) {
          localStorage.removeItem(DRAFT_SESSION_KEY);
        }
      }
    }
  }, [user]);

  // Auto-guardar sesión activa
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(activeSession));
    }
  }, [activeSession]);

  function restoreDraft() {
    if (draftSession) {
      setActiveSession(draftSession);
      setShowDraftModal(false);
      setDraftSession(null);
    }
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_SESSION_KEY);
    setShowDraftModal(false);
    setDraftSession(null);
  }

  useEffect(() => {
    if (user) {
      loadRoutines();
      loadRecentWorkouts();
      loadWorkoutDates();
    }
  }, [user]);

  async function loadRoutines() {
    try {
      console.log('Cargando rutinas para user_id:', user!.id);

      const { data: routinesData, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar rutinas:', error);
        throw error;
      }

      console.log('Rutinas cargadas:', routinesData);

      if (routinesData) {
        const routinesWithDays = await Promise.all(
          routinesData.map(async (routine: any) => {
            const { data: daysData } = await supabase
              .from('routine_days')
              .select('*')
              .eq('routine_id', routine.id)
              .order('day_number', { ascending: true });

            let totalExercises = 0;
            const days = await Promise.all(
              (daysData || []).map(async (day: any) => {
                const { data: exercisesData } = await supabase
                  .from('routine_exercises')
                  .select('*')
                  .eq('routine_day_id', day.id)
                  .order('order_index', { ascending: true });

                const exercises = (exercisesData || []).map((ex: any) => ({
                  id: ex.id,
                  routineDayId: ex.routine_day_id,
                  exerciseId: ex.exercise_id,
                  exerciseName: ex.exercise_name,
                  orderIndex: ex.order_index,
                  sets: ex.sets,
                  reps: ex.reps,
                  weightKg: ex.weight_kg,
                  restSeconds: ex.rest_seconds,
                  notes: ex.notes,
                  createdAt: ex.created_at
                }));

                totalExercises += exercises.length;

                return {
                  id: day.id,
                  routineId: day.routine_id,
                  dayNumber: day.day_number,
                  dayName: day.day_name,
                  notes: day.notes,
                  createdAt: day.created_at,
                  updatedAt: day.updated_at,
                  exercises
                };
              })
            );

            return {
              id: routine.id,
              userId: routine.user_id,
              routineName: routine.routine_name,
              description: routine.description,
              workoutType: routine.workout_type,
              totalDays: routine.total_days,
              isActive: routine.is_active,
              createdAt: routine.created_at,
              updatedAt: routine.updated_at,
              days,
              totalExercises
            };
          })
        );

        console.log('Rutinas con días cargadas:', routinesWithDays);
        setRoutines(routinesWithDays);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  }

  async function loadWorkoutDates() {
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('workouts')
        .select('date')
        .eq('user_id', user!.id)
        .gte('date', thirtyDaysAgo);

      if (error) throw error;

      if (data) {
        setWorkoutDates(data.map((w: any) => w.date));
      }
    } catch (error) {
      console.error('Error loading workout dates:', error);
    }
  }

  async function loadRecentWorkouts() {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        const workouts = data.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          date: w.date,
          routineName: w.routine_name,
          workoutType: w.workout_type,
          durationMinutes: w.duration_minutes,
          notes: w.notes,
          visibility: w.visibility,
          createdAt: w.created_at
        }));
        setRecentWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    }
  }

  async function loadAllWorkouts() {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const workouts = data.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          date: w.date,
          routineName: w.routine_name,
          workoutType: w.workout_type,
          durationMinutes: w.duration_minutes,
          notes: w.notes,
          visibility: w.visibility,
          createdAt: w.created_at
        }));
        setAllWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error loading all workouts:', error);
    }
  }

  function handleShowFullHistory() {
    loadAllWorkouts();
    setShowFullHistory(true);
  }

  function startQuickWorkout() {
    const session: WorkoutSession = {
      startTime: new Date(),
      exercises: [],
      notes: ''
    };
    setActiveSession(session);
  }

  function startRoutineWorkout(routine: RoutineWithDays, dayNumber: number) {
    const day = routine.days.find(d => d.dayNumber === dayNumber);
    if (!day) {
      alert('Día no encontrado');
      return;
    }

    // Cargar ejercicios de la rutina, pero sin series precargadas
    // Las series se crean dinámicamente cuando el usuario hace "Hecho"
    // Los valores de peso/reps se sugieren desde el historial o la rutina
    const exercises: WorkoutSessionExercise[] = day.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup: '',
      sets: [], // Sin series precargadas - se agregan al hacer "Hecho"
      notes: '',
      // Guardar valores de la rutina como sugerencia
      routineSets: ex.sets,
      routineReps: ex.reps,
      routineWeight: ex.weightKg || 0
    }));

    const session: WorkoutSession = {
      routineId: routine.id,
      routineName: routine.routineName,
      dayNumber: day.dayNumber,
      dayName: day.dayName,
      startTime: new Date(),
      exercises,
      notes: ''
    };

    setActiveSession(session);
    setShowRoutineSelect(false);
    setSelectedRoutine(null);
  }

  async function finishWorkout(session: WorkoutSession) {
    try {
      setSaving(true);

      const durationMinutes = Math.floor((Date.now() - session.startTime.getTime()) / 60000);

      console.log('Intentando guardar workout con datos:', {
        user_id: user!.id,
        date: new Date().toISOString().split('T')[0],
        routine_name: session.routineName || 'Entrenamiento Rápido',
        workout_type: 'Fuerza',
        duration_minutes: durationMinutes,
        notes: session.notes,
        visibility: 'PUBLIC'
      });

      // Crear el workout
      const { data: workoutData, error: workoutError } = await (supabase
        .from('workouts'))
        .insert({
          user_id: user!.id,
          date: new Date().toISOString().split('T')[0],
          routine_name: session.routineName || 'Entrenamiento Rápido',
          workout_type: 'Fuerza',
          duration_minutes: durationMinutes,
          notes: session.notes,
          visibility: 'PUBLIC'
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Error al crear workout:', workoutError);
        throw workoutError;
      }

      console.log('Workout creado exitosamente:', workoutData);

      // Crear las entradas de ejercicios
      const entries = session.exercises.flatMap(exercise => {
        const completedSets = exercise.sets.filter(s => s.completed);
        if (completedSets.length === 0) return [];

        const repsPerSet = completedSets.map(s => s.reps).join(',');
        const weightPerSet = completedSets.map(s => s.weightKg).join(',');

        return {
          workout_id: workoutData.id,
          exercise_id: exercise.exerciseId,
          exercise_name: exercise.exerciseName,
          sets: completedSets.length,
          reps_per_set: repsPerSet,
          weight_per_set: weightPerSet,
          unit: 'kg' as const,
          rpe: null
        };
      });

      if (entries.length > 0) {
        const { error: entriesError } = await (supabase
          .from('workout_entries'))
          .insert(entries);

        if (entriesError) throw entriesError;
      }

      // Crear check-in automático
      const { error: checkinError } = await (supabase
        .from('gym_checkins'))
        .insert({
          user_id: user!.id,
          date: new Date().toISOString().split('T')[0],
          status: 'WENT',
          linked_workout_id: workoutData.id
        });

      if (checkinError && checkinError.code !== '23505') {
        // Ignorar error de duplicado
        throw checkinError;
      }

      setActiveSession(null);
      localStorage.removeItem(DRAFT_SESSION_KEY); // Limpiar borrador
      loadRecentWorkouts();
      loadWorkoutDates();
      alert('Entrenamiento guardado!');
    } catch (error: any) {
      console.error('Error saving workout:', error);
      const errorMessage = error?.message || error?.hint || 'Error desconocido';
      alert(`Error al guardar el entrenamiento:\n${errorMessage}\n\nRevisa la consola para más detalles.`);
    } finally {
      setSaving(false);
    }
  }

  function cancelWorkout() {
    const choice = confirm('¿Cancelar entrenamiento?\n\nOK = Guardar borrador para continuar después\nCancelar = Descartar todo');
    if (choice) {
      // Guardar como borrador (ya se guarda automáticamente)
      setActiveSession(null);
    } else if (confirm('¿Descartar el entrenamiento completamente?')) {
      localStorage.removeItem(DRAFT_SESSION_KEY);
      setActiveSession(null);
    }
  }

  if (activeSession) {
    return (
      <WorkoutSessionComponent
        session={activeSession}
        onUpdateSession={setActiveSession}
        onFinish={finishWorkout}
        onCancel={cancelWorkout}
      />
    );
  }

  // Modal para restaurar borrador
  if (showDraftModal && draftSession) {
    const draftTime = new Date(draftSession.startTime);
    const draftAge = Math.floor((Date.now() - draftTime.getTime()) / 60000);
    const draftExercises = draftSession.exercises.length;
    const completedSets = draftSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0
    );

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <History size={32} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Entrenamiento sin terminar</h2>
            <p className="text-slate-400 text-sm">
              Encontramos un entrenamiento que no terminaste
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Rutina:</span>
              <span className="text-white font-medium">{draftSession.routineName || 'Entrenamiento Rápido'}</span>
            </div>
            {draftSession.dayName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Día:</span>
                <span className="text-white">{draftSession.dayName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ejercicios:</span>
              <span className="text-white">{draftExercises}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Series completadas:</span>
              <span className="text-emerald-400">{completedSets}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Hace:</span>
              <span className="text-white">{draftAge < 60 ? `${draftAge} min` : `${Math.floor(draftAge / 60)}h ${draftAge % 60}min`}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={discardDraft}
              className="flex-1"
            >
              Descartar
            </Button>
            <Button
              onClick={restoreDraft}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-bold text-white">Entrenamiento</h1>
        <p className="text-slate-400 text-sm sm:text-base">Registra tus entrenamientos</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Button
          size="md"
          fullWidth
          onClick={() => {
            if (routines.length === 0) {
              alert('No tienes rutinas creadas. Crea una rutina primero en la sección Rutinas.');
              return;
            }
            setShowRoutineSelect(true);
          }}
          className="py-3 sm:py-4"
        >
          <Play size={18} />
          <span className="hidden sm:inline">Comenzar rutina</span>
          <span className="sm:hidden">Rutina</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={startQuickWorkout}
          className="py-3 sm:py-4"
        >
          <Zap size={18} />
          <span className="hidden sm:inline">Registro rápido</span>
          <span className="sm:hidden">Rápido</span>
        </Button>
      </div>

      {/* Activity Tracker - Solo semana actual */}
      <WeeklyTracker
        workoutDates={workoutDates}
        trainingDays={user?.trainingDays ?? [1, 3, 5]}
      />

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <Card padding="sm" className="sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-xl font-bold text-white">Recientes</h2>
            <button
              onClick={handleShowFullHistory}
              className="flex items-center gap-1 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <History size={14} />
              <span className="hidden sm:inline">Ver historial</span>
              <span className="sm:hidden">Historial</span>
            </button>
          </div>
          <div className="space-y-2">
            {recentWorkouts.map(workout => (
              <button
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 transition-all text-left"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-bold text-white text-sm truncate">{workout.routineName}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(workout.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    {workout.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {workout.durationMinutes}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold hidden sm:inline">
                    {workout.workoutType}
                  </span>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {recentWorkouts.length === 0 && (
        <Card padding="sm" className="sm:p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp size={36} className="text-slate-600 mb-3" />
            <h3 className="text-base sm:text-xl font-bold text-white mb-1">Sin entrenamientos</h3>
            <p className="text-slate-400 text-sm">Empezá hoy tu primera sesión</p>
          </div>
        </Card>
      )}

      {/* Routine Selection Modal */}
      {showRoutineSelect && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center sm:p-4 z-[100]"
          onClick={() => {
            setShowRoutineSelect(false);
            setSelectedRoutine(null);
          }}
        >
          <div
            className="bg-slate-800 sm:rounded-2xl w-full max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto rounded-t-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              {selectedRoutine ? 'Seleccionar Día' : 'Seleccionar Rutina'}
            </h2>

            {!selectedRoutine ? (
              <div className="space-y-2 sm:space-y-3">
                {routines.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => setSelectedRoutine(routine)}
                    className="w-full p-3 sm:p-4 bg-slate-900 border border-slate-700 rounded-xl text-left hover:border-blue-500 hover:bg-slate-800 transition-all"
                  >
                    <h3 className="font-bold text-white text-sm sm:text-lg mb-1">{routine.routineName}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded">
                        {routine.workoutType}
                      </span>
                      <span>{routine.totalDays} días</span>
                      <span>•</span>
                      <span>{routine.totalExercises} ej.</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-3 p-3 bg-slate-900 rounded-lg">
                  <h3 className="font-bold text-white text-sm">{selectedRoutine.routineName}</h3>
                  {selectedRoutine.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{selectedRoutine.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedRoutine.days.map(day => (
                    <button
                      key={day.id}
                      onClick={() => startRoutineWorkout(selectedRoutine, day.dayNumber)}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-left hover:border-blue-500 hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white text-sm">Día {day.dayNumber}: {day.dayName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {day.exercises.length} ejercicios
                          </p>
                        </div>
                        <Play size={20} className="text-blue-500 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-3"
                  onClick={() => setSelectedRoutine(null)}
                >
                  Volver
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}

      {/* Full History Modal */}
      {showFullHistory && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center sm:p-4 z-[100]"
          onClick={() => setShowFullHistory(false)}
        >
          <div
            className="bg-slate-800 sm:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Historial</h2>
                <p className="text-xs sm:text-sm text-slate-400">{allWorkouts.length} entrenamientos</p>
              </div>
              <button
                onClick={() => setShowFullHistory(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <TrendingUp size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {allWorkouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp size={36} className="text-slate-600 mb-3" />
                  <p className="text-slate-400">No hay entrenamientos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allWorkouts.map(workout => (
                    <button
                      key={workout.id}
                      onClick={() => {
                        setShowFullHistory(false);
                        setSelectedWorkout(workout);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 transition-all text-left"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{workout.routineName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(workout.date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          {workout.durationMinutes && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {workout.durationMinutes} min
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-bold">
                          {workout.workoutType}
                        </span>
                        <ChevronRight size={20} className="text-slate-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700">
              <Button variant="secondary" fullWidth onClick={() => setShowFullHistory(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
