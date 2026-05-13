import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Dumbbell, Copy, Globe, Lock, Compass } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { RoutineWithDays } from '../types';
import { Button, Card } from '../components';
import { CreateRoutineModal } from '../components/CreateRoutineModal';
import { EditRoutineModal } from '../components/EditRoutineModal';

export function Routines() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<RoutineWithDays[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineWithDays | null>(null);

  useEffect(() => {
    if (user) {
      loadRoutines();
    }
  }, [user]);

  async function loadRoutines() {
    try {
      setLoading(true);

      // Cargar rutinas del usuario
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (routinesError) throw routinesError;

      if (routinesData) {
        // Cargar días y ejercicios para cada rutina
        const routinesWithDays = await Promise.all(
          routinesData.map(async (routine: any) => {
            // Cargar días de la rutina
            const { data: daysData } = await supabase
              .from('routine_days')
              .select('*')
              .eq('routine_id', routine.id)
              .order('day_number', { ascending: true });

            let totalExercises = 0;
            const days = await Promise.all(
              (daysData || []).map(async (day: any) => {
                // Cargar ejercicios de cada día
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
              visibility: routine.visibility ?? 'PRIVATE',
              cloneCount: routine.clone_count ?? 0,
              createdAt: routine.created_at,
              updatedAt: routine.updated_at,
              days,
              totalExercises
            };
          })
        );

        setRoutines(routinesWithDays);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRoutine(routineId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta rutina? Se eliminarán todos los días y ejercicios.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (error) throw error;

      await loadRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Error al eliminar la rutina');
    }
  }

  async function handleDuplicateRoutine(routine: RoutineWithDays) {
    try {
      const { error } = await (supabase.rpc as any)('duplicate_routine', {
        p_routine_id: routine.id,
        p_new_name: `${routine.routineName} (Copia)`
      });

      if (error) throw error;

      await loadRoutines();
    } catch (error) {
      console.error('Error duplicating routine:', error);
      alert('Error al duplicar la rutina');
    }
  }

  async function handleToggleVisibility(routine: RoutineWithDays) {
    const newVisibility = routine.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';

    try {
      const { error } = await (supabase
        .from('routines') as any)
        .update({ visibility: newVisibility })
        .eq('id', routine.id);

      if (error) throw error;

      await loadRoutines();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Error al cambiar la visibilidad');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">Mis Rutinas</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-0.5 sm:mt-1">Gestiona tus programas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/rutinas/explorar')}
            className="text-sm sm:text-base px-3 sm:px-4"
          >
            <Compass size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Explorar</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="text-sm sm:text-base px-3 sm:px-4"
          >
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Nueva Rutina</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Cargando rutinas...</p>
        </div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-3 text-center px-4">
          <Dumbbell size={48} className="text-slate-600" />
          <h2 className="text-lg sm:text-2xl font-semibold text-white">No tienes rutinas</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md">
            Crea tu primera rutina personalizada
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="text-sm"
          >
            <Plus size={18} className="mr-2" />
            Crear Rutina
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => (
            <Card key={routine.id} padding="none" className="p-3 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base sm:text-xl font-semibold text-white mb-1.5 truncate">{routine.routineName}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">
                      {routine.workoutType}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                      {routine.totalDays} {routine.totalDays === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${
                      routine.visibility === 'PUBLIC'
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => handleToggleVisibility(routine)}
                    title={routine.visibility === 'PUBLIC' ? 'Hacer privada' : 'Hacer publica'}
                  >
                    {routine.visibility === 'PUBLIC' ? <Globe size={16} /> : <Lock size={16} />}
                  </button>
                  <button
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => handleDuplicateRoutine(routine)}
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => setEditingRoutine(routine)}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => handleDeleteRoutine(routine.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {routine.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{routine.description}</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <span>{routine.days.length}/{routine.totalDays} días</span>
                <span>•</span>
                <span>{routine.totalExercises} ejercicios</span>
              </div>

              {routine.days.length > 0 && (
                <div className="border-t border-slate-700 pt-3">
                  <div className="space-y-1.5">
                    {routine.days.map((day) => (
                      <div key={day.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded flex-shrink-0">
                            D{day.dayNumber}
                          </span>
                          <span className="text-xs font-medium text-white truncate">{day.dayName}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                          {day.exercises.length} ej.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Routine Modal */}
      {showCreateModal && (
        <CreateRoutineModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadRoutines();
          }}
        />
      )}

      {/* Edit Routine Modal */}
      {editingRoutine && (
        <EditRoutineModal
          routine={editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onUpdated={() => {
            setEditingRoutine(null);
            loadRoutines();
          }}
        />
      )}
    </div>
  );
}
