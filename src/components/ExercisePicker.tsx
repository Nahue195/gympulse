import { useState, useEffect } from 'react';
import { X, Search, Plus, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Exercise } from '../types';
import { Button } from './';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);

  // Estado para crear ejercicio personalizado
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: '',
    equipment: '',
    category: 'Fuerza' as 'Fuerza' | 'Cardio' | 'Flexibilidad',
    trackingType: 'reps' as 'reps' | 'time' | 'distance',
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  // Obtener grupos musculares únicos de los ejercicios
  const muscleGroups = ['Todos', ...Array.from(new Set(exercises.map(ex => ex.muscleGroup).filter(Boolean))).sort()];

  // Opciones según categoría
  const categoryConfig = {
    Fuerza: {
      muscleGroups: ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Cuerpo Completo'],
      equipment: ['Peso Corporal', 'Mancuernas', 'Barra', 'Máquina', 'Poleas', 'Kettlebell', 'Bandas', 'Otro'],
      defaultTracking: 'reps' as const
    },
    Cardio: {
      muscleGroups: ['Cardio', 'Piernas', 'Cuerpo Completo'],
      equipment: ['Sin Equipo', 'Caminadora', 'Bicicleta Estática', 'Elíptica', 'Remo', 'Bicicleta', 'Cuerda de Saltar', 'Escaladora', 'Otro'],
      defaultTracking: 'time' as const
    },
    Flexibilidad: {
      muscleGroups: ['Cuerpo Completo', 'Espalda', 'Piernas', 'Hombros', 'Cadera'],
      equipment: ['Sin Equipo', 'Colchoneta', 'Foam Roller', 'Bandas', 'Otro'],
      defaultTracking: 'time' as const
    }
  };

  const currentConfig = categoryConfig[newExercise.category];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedMuscleGroup, exercises]);

  async function loadExercises() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const exercisesData: Exercise[] = data.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          muscleGroup: ex.muscle_group,
          equipment: ex.equipment,
          description: ex.description,
          isCustom: ex.is_custom,
          userId: ex.user_id,
          createdAt: ex.created_at
        }));

        setExercises(exercisesData);
        setFilteredExercises(exercisesData);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterExercises() {
    let filtered = exercises;

    // Filtrar por grupo muscular
    if (selectedMuscleGroup !== 'Todos') {
      filtered = filtered.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    // Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup.toLowerCase().includes(query) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(query))
      );
    }

    setFilteredExercises(filtered);
  }

  async function handleCreateExercise() {
    if (!user || !newExercise.name.trim() || !newExercise.muscleGroup) return;

    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: newExercise.name.trim(),
          muscle_group: newExercise.muscleGroup,
          equipment: newExercise.equipment || null,
          category: newExercise.category,
          description: newExercise.notes || null,
          tracking_type: newExercise.trackingType,
          user_id: user.id,
          is_custom: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const createdExercise: Exercise = {
          id: data.id,
          name: data.name,
          category: data.category || newExercise.category,
          muscleGroup: data.muscle_group,
          equipment: data.equipment,
          description: data.description,
          isCustom: data.is_custom,
          userId: data.user_id,
          createdAt: data.created_at
        };

        onSelect(createdExercise);
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Error al crear el ejercicio. Asegúrate de ejecutar el SQL add-exercise-columns.sql');
    } finally {
      setCreating(false);
    }
  }

  function openCreateForm() {
    setNewExercise({
      name: searchQuery.trim(),
      muscleGroup: '',
      equipment: '',
      category: 'Fuerza',
      trackingType: 'reps',
      notes: ''
    });
    setShowCreateForm(true);
  }

  function handleCategoryChange(category: 'Fuerza' | 'Cardio' | 'Flexibilidad') {
    const config = categoryConfig[category];
    setNewExercise({
      ...newExercise,
      category,
      trackingType: config.defaultTracking,
      muscleGroup: '', // Reset al cambiar categoría
      equipment: ''
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center sm:p-4"
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] sm:rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl"
        style={{ height: '100vh', maxHeight: '100vh', animation: 'slideUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b border-slate-700 flex-shrink-0">
          {showCreateForm ? (
            <>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-white">Crear Ejercicio</h2>
              <div className="w-8" />
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white">Seleccionar Ejercicio</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 sm:px-6">
          {showCreateForm ? (
            /* Formulario de creación de ejercicio */
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {/* Tipo de ejercicio (Categoría) - PRIMERO */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Tipo de ejercicio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Fuerza', 'Cardio', 'Flexibilidad'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                          newExercise.category === cat
                            ? cat === 'Fuerza'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : cat === 'Cardio'
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {cat === 'Fuerza' ? '💪 Fuerza' : cat === 'Cardio' ? '🏃 Cardio' : '🧘 Flexibilidad'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nombre del ejercicio *
                  </label>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder={
                      newExercise.category === 'Cardio'
                        ? 'Ej: Correr en caminadora, Bicicleta...'
                        : newExercise.category === 'Flexibilidad'
                        ? 'Ej: Estiramiento de isquiotibiales...'
                        : 'Ej: Sentadilla Búlgara...'
                    }
                    autoFocus
                  />
                </div>

                {/* Equipamiento - Dinámico según categoría */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {newExercise.category === 'Cardio' ? 'Tipo / Equipo' : 'Equipamiento'} {newExercise.category !== 'Fuerza' ? '' : '(opcional)'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentConfig.equipment.map((equip) => (
                      <button
                        key={equip}
                        type="button"
                        onClick={() => setNewExercise({ ...newExercise, equipment: newExercise.equipment === equip ? '' : equip })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          newExercise.equipment === equip
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500'
                        }`}
                      >
                        {equip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grupo muscular - Dinámico según categoría */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Zona / Grupo muscular *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentConfig.muscleGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setNewExercise({ ...newExercise, muscleGroup: group })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          newExercise.muscleGroup === group
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de seguimiento */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    ¿Cómo se mide?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExercise({ ...newExercise, trackingType: 'reps' })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        newExercise.trackingType === 'reps'
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-violet-500'
                      }`}
                    >
                      Series / Reps
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExercise({ ...newExercise, trackingType: 'time' })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        newExercise.trackingType === 'time'
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-violet-500'
                      }`}
                    >
                      Minutos
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExercise({ ...newExercise, trackingType: 'distance' })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        newExercise.trackingType === 'distance'
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-violet-500'
                      }`}
                    >
                      Distancia (km)
                    </button>
                  </div>
                </div>

                {/* Notas adicionales */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={newExercise.notes}
                    onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="Ej: Mantener espalda recta, velocidad moderada..."
                    rows={2}
                  />
                </div>

                {/* Preview del ejercicio */}
                {newExercise.name && (
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Vista previa:</p>
                    <p className="font-medium text-white">{newExercise.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        newExercise.category === 'Fuerza' ? 'bg-blue-500/20 text-blue-400' :
                        newExercise.category === 'Cardio' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {newExercise.category}
                      </span>
                      {newExercise.muscleGroup && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                          {newExercise.muscleGroup}
                        </span>
                      )}
                      {newExercise.equipment && (
                        <span className="px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded text-xs">
                          {newExercise.equipment}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded text-xs">
                        {newExercise.trackingType === 'reps' ? 'Series/Reps' :
                         newExercise.trackingType === 'time' ? 'Minutos' : 'Distancia'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botón crear */}
                <Button
                  onClick={handleCreateExercise}
                  disabled={!newExercise.name.trim() || !newExercise.muscleGroup || creating}
                  className="w-full mt-4"
                >
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} />
                      Crear y seleccionar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
          {/* Search Section */}
          <div className="flex-shrink-0 py-3">
            <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-slate-700">
              {/* Search Input */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Buscar ejercicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Muscle Group Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {muscleGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedMuscleGroup(group)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all flex-shrink-0 ${
                      selectedMuscleGroup === group
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-blue-600 hover:text-white'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))] min-h-0">
            {!loading && filteredExercises.length > 0 && (
              <div className="mb-2 px-1 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''}
                </p>
                {selectedMuscleGroup !== 'Todos' && (
                  <button
                    onClick={() => setSelectedMuscleGroup('Todos')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Ver todos
                  </button>
                )}
              </div>
            )}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
                <p className="text-slate-400 text-sm text-center">No se encontraron ejercicios</p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button onClick={openCreateForm} className="w-full">
                    <Plus size={18} />
                    Crear ejercicio personalizado
                  </Button>
                  {searchQuery && (
                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => onSelect(exercise)}
                    className="group relative w-full flex items-center justify-between gap-3 px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-left transition-all hover:bg-slate-800 hover:border-blue-500 active:scale-[0.98] overflow-hidden"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm truncate">
                        {exercise.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-medium capitalize">
                          {exercise.muscleGroup}
                        </span>
                        {exercise.equipment && (
                          <span className="text-slate-500 truncate">{exercise.equipment}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-slate-500 flex-shrink-0 text-lg">
                      →
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Botón flotante para crear ejercicio */}
            {!loading && filteredExercises.length > 0 && (
              <div className="mt-4 pb-2">
                <button
                  onClick={openCreateForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 text-sm font-medium hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  <Plus size={18} />
                  Crear ejercicio personalizado
                </button>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
