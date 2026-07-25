import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Dumbbell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { RoutineWithDays, WorkoutType } from '../types';
import { RoutineCard } from '../components/RoutineCard';
import { RoutineDetailModal } from '../components/RoutineDetailModal';

export function PublicRoutines() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<RoutineWithDays[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<WorkoutType | 'all'>('all');
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineWithDays | null>(null);
  const [, setCloning] = useState(false);

  useEffect(() => {
    loadPublicRoutines();
  }, []);

  async function loadPublicRoutines() {
    try {
      setLoading(true);

      // Load public routines
      const { data: routinesData, error } = await (supabase
        .from('routines'))
        .select('*')
        .eq('visibility', 'PUBLIC')
        .eq('is_active', true)
        .order('clone_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Load user info for each routine
      if (routinesData) {
        const userIds = [...new Set(routinesData.map((r: any) => r.user_id))];
        const { data: usersData } = await (supabase
          .from('users'))
          .select('id, display_name, username, avatar_url')
          .in('id', userIds);

        const usersMap: Record<string, any> = {};
        (usersData || []).forEach((u: any) => {
          usersMap[u.id] = u;
        });

        routinesData.forEach((r: any) => {
          r.users = usersMap[r.user_id] || null;
        });
      }

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
              visibility: routine.visibility,
              cloneCount: routine.clone_count ?? 0,
              createdAt: routine.created_at,
              updatedAt: routine.updated_at,
              days,
              totalExercises,
              user: routine.users ? {
                id: routine.users.id,
                displayName: routine.users.display_name,
                username: routine.users.username,
                avatarUrl: routine.users.avatar_url,
                createdAt: routine.users.created_at
              } : undefined
            };
          })
        );

        setRoutines(routinesWithDays);
      }
    } catch (error) {
      console.error('Error loading public routines:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCloneRoutine() {
    if (!selectedRoutine || !user) return;

    try {
      setCloning(true);

      // Call the clone function
      const { error } = await supabase.rpc('clone_public_routine', {
        p_routine_id: selectedRoutine.id,
        p_user_id: user.id
      });

      if (error) throw error;

      alert('Rutina copiada exitosamente! La encontraras en "Mis Rutinas"');
      setSelectedRoutine(null);
      loadPublicRoutines(); // Refresh to update clone count
    } catch (error: any) {
      console.error('Error cloning routine:', error);
      alert('Error al copiar la rutina: ' + (error.message || 'Error desconocido'));
    } finally {
      setCloning(false);
    }
  }

  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch = routine.routineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.user?.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || routine.workoutType === filterType;

    return matchesSearch && matchesType;
  });

  const workoutTypes: WorkoutType[] = ['Fuerza', 'Cardio', 'Híbrido', 'Movilidad', 'Otro'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rutinas')}
          className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Explorar Rutinas</h1>
          <p className="text-slate-400 mt-1">Descubre rutinas de la comunidad</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar rutinas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as WorkoutType | 'all')}
          className="px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos los tipos</option>
          {workoutTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Cargando rutinas...</p>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <Dumbbell size={64} className="text-slate-600" />
          <h2 className="text-2xl font-semibold text-white">No se encontraron rutinas</h2>
          <p className="text-slate-400 max-w-md">
            {searchQuery || filterType !== 'all'
              ? 'Intenta con otros filtros de busqueda'
              : 'Todavia no hay rutinas publicas'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              showUser
              onClick={() => setSelectedRoutine(routine)}
            />
          ))}
        </div>
      )}

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <RoutineDetailModal
          routine={selectedRoutine}
          onClose={() => setSelectedRoutine(null)}
          onClone={handleCloneRoutine}
          isOwnRoutine={selectedRoutine.userId === user?.id}
        />
      )}
    </div>
  );
}
