import { useState } from 'react';
import { X, Plus, Trash2, Globe, Lock, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { WorkoutType, Exercise, RoutineWithDays, RoutineExercise, RoutineDayWithExercises, RoutineVisibility } from '../types';
import { Button, Input } from './';
import { ExercisePicker } from './ExercisePicker';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableExerciseItemProps {
  exercise: RoutineExercise;
  index: number;
  onUpdate: (updates: Partial<RoutineExercise>) => void;
  onRemove: () => void;
}

function SortableExerciseItem({ exercise, index, onUpdate, onRemove }: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id || `new-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-1 rounded cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
        <span className="flex items-center justify-center w-7 h-7 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold flex-shrink-0">
          {index + 1}
        </span>
        <span className="font-semibold text-white flex-1">{exercise.exerciseName}</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap pl-8">
        <div className="flex flex-col gap-1 min-w-[80px]">
          <label className="text-xs text-slate-400 font-medium">Sets</label>
          <input
            type="number"
            min="1"
            max="20"
            value={exercise.sets}
            onChange={(e) => onUpdate({ sets: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[80px]">
          <label className="text-xs text-slate-400 font-medium">Reps</label>
          <input
            type="number"
            min="1"
            max="100"
            value={exercise.reps}
            onChange={(e) => onUpdate({ reps: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[80px]">
          <label className="text-xs text-slate-400 font-medium">Kg</label>
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="-"
            value={exercise.weightKg || ''}
            onChange={(e) => onUpdate({ weightKg: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="button"
          className="ml-auto p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          onClick={onRemove}
          title="Eliminar ejercicio"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

interface EditRoutineModalProps {
  routine: RoutineWithDays;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditRoutineModal({ routine, onClose, onUpdated }: EditRoutineModalProps) {
  const { user } = useAuth();
  const [routineName, setRoutineName] = useState(routine.routineName);
  const [description, setDescription] = useState(routine.description || '');
  const [workoutType, setWorkoutType] = useState<WorkoutType>(routine.workoutType);
  const [visibility, setVisibility] = useState<RoutineVisibility>(routine.visibility || 'PRIVATE');
  const [totalDays, setTotalDays] = useState(routine.totalDays);
  const [days, setDays] = useState<RoutineDayWithExercises[]>(routine.days);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const exercises = days[selectedDayIndex].exercises;
      const oldIndex = exercises.findIndex(
        (ex) => (ex.id || `new-${exercises.indexOf(ex)}`) === active.id
      );
      const newIndex = exercises.findIndex(
        (ex) => (ex.id || `new-${exercises.indexOf(ex)}`) === over.id
      );

      const newExercises = arrayMove(exercises, oldIndex, newIndex).map(
        (ex, i) => ({ ...ex, orderIndex: i })
      );

      const newDays = [...days];
      newDays[selectedDayIndex].exercises = newExercises;
      setDays(newDays);
    }
  }

  function handleAddDay() {
    const newDayNumber = days.length + 1;
    const newDay: RoutineDayWithExercises = {
      id: '',
      routineId: routine.id,
      dayNumber: newDayNumber,
      dayName: `Día ${newDayNumber}`,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: []
    };
    setDays([...days, newDay]);
    setTotalDays(newDayNumber);
  }

  function handleRemoveDay(index: number) {
    if (days.length <= 1) {
      alert('Debe haber al menos un día en la rutina');
      return;
    }
    const newDays = days.filter((_, i) => i !== index);
    const renumberedDays = newDays.map((day, i) => ({
      ...day,
      dayNumber: i + 1
    }));
    setDays(renumberedDays);
    setTotalDays(renumberedDays.length);
    if (selectedDayIndex >= renumberedDays.length) {
      setSelectedDayIndex(renumberedDays.length - 1);
    }
  }

  function handleDayNameChange(index: number, newName: string) {
    const newDays = [...days];
    newDays[index].dayName = newName;
    setDays(newDays);
  }

  function handleAddExercise(exercise: Exercise) {
    const newExercise: RoutineExercise = {
      id: '',
      routineDayId: days[selectedDayIndex].id || '',
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex: days[selectedDayIndex].exercises.length,
      sets: 3,
      reps: 10,
      weightKg: null,
      restSeconds: null,
      notes: null,
      createdAt: new Date().toISOString()
    };

    const newDays = [...days];
    newDays[selectedDayIndex].exercises.push(newExercise);
    setDays(newDays);
    setShowExercisePicker(false);
  }

  function handleUpdateExercise(dayIndex: number, exerciseIndex: number, updates: Partial<RoutineExercise>) {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex] = {
      ...newDays[dayIndex].exercises[exerciseIndex],
      ...updates
    };
    setDays(newDays);
  }

  function handleRemoveExercise(dayIndex: number, exerciseIndex: number) {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    newDays[dayIndex].exercises.forEach((ex, i) => {
      ex.orderIndex = i;
    });
    setDays(newDays);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !routineName.trim()) {
      alert('El nombre de la rutina es requerido');
      return;
    }

    try {
      setLoading(true);

      // Actualizar información de la rutina
      const { error: routineError } = await (supabase
        .from('routines') as any)
        .update({
          routine_name: routineName.trim(),
          description: description.trim() || null,
          workout_type: workoutType,
          total_days: totalDays,
          visibility: visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', routine.id);

      if (routineError) throw routineError;

      // Obtener IDs de días existentes
      const existingDayIds = days.filter(d => d.id).map(d => d.id);

      // Eliminar días que ya no están
      if (existingDayIds.length > 0) {
        // Solo eliminar días que NO están en la lista de existentes
        const { error: deleteDaysError } = await supabase
          .from('routine_days')
          .delete()
          .eq('routine_id', routine.id)
          .not('id', 'in', `(${existingDayIds.join(',')})`);

        if (deleteDaysError) throw deleteDaysError;
      }
      // Si no hay días existentes, no eliminamos nada (son todos nuevos)

      // Actualizar o crear días
      for (const day of days) {
        let dayId = day.id;

        if (dayId) {
          // Actualizar día existente
          const { error: updateDayError } = await (supabase
            .from('routine_days') as any)
            .update({
              day_number: day.dayNumber,
              day_name: day.dayName,
              notes: day.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', dayId);

          if (updateDayError) throw updateDayError;
        } else {
          // Crear nuevo día
          const { data: newDay, error: createDayError } = await (supabase
            .from('routine_days') as any)
            .insert({
              routine_id: routine.id,
              day_number: day.dayNumber,
              day_name: day.dayName,
              notes: day.notes
            })
            .select()
            .single();

          if (createDayError) throw createDayError;
          dayId = newDay.id;
        }

        // Eliminar TODOS los ejercicios del día y reinsertarlos
        // Esto evita conflictos con el constraint unique_order_per_day al reordenar
        const { error: deleteExercisesError } = await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_day_id', dayId);

        if (deleteExercisesError) throw deleteExercisesError;

        // Insertar todos los ejercicios con sus nuevos order_index
        if (day.exercises.length > 0) {
          const exercisesToInsert = day.exercises.map((exercise, index) => ({
            routine_day_id: dayId,
            exercise_id: exercise.exerciseId,
            exercise_name: exercise.exerciseName,
            order_index: index,
            sets: exercise.sets,
            reps: exercise.reps,
            weight_kg: exercise.weightKg,
            rest_seconds: exercise.restSeconds,
            notes: exercise.notes
          }));

          const { error: insertExError } = await (supabase
            .from('routine_exercises') as any)
            .insert(exercisesToInsert);

          if (insertExError) throw insertExError;
        }
      }

      onUpdated();
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Error al actualizar la rutina');
    } finally {
      setLoading(false);
    }
  }

  const workoutTypes: WorkoutType[] = ['Fuerza', 'Cardio', 'Híbrido', 'Movilidad', 'Otro'];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl"
        style={{ height: '90vh', maxHeight: '90vh', animation: 'slideUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Editar Rutina</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Información de la rutina */}
            <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-white">Información de la rutina</h3>

              <div className="space-y-2">
                <label htmlFor="routineName" className="block text-sm font-medium text-slate-300">
                  Nombre de la rutina *
                </label>
                <Input
                  id="routineName"
                  type="text"
                  placeholder="Ej: Push Pull Legs, Full Body, Upper Lower..."
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-base placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="Describe el objetivo de esta rutina..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="workoutType" className="block text-sm font-medium text-slate-300">
                    Tipo de entrenamiento
                  </label>
                  <select
                    id="workoutType"
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                  >
                    {workoutTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="totalDays" className="block text-sm font-medium text-slate-300">
                    Total de días
                  </label>
                  <Input
                    id="totalDays"
                    type="number"
                    min="1"
                    max="7"
                    value={totalDays}
                    disabled
                  />
                  <p className="text-xs text-slate-500">Se calcula automáticamente</p>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Visibilidad
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility('PRIVATE')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      visibility === 'PRIVATE'
                        ? 'bg-slate-700 border-slate-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Lock size={18} />
                    <span className="font-medium">Privada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('PUBLIC')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      visibility === 'PUBLIC'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500'
                    }`}
                  >
                    <Globe size={18} />
                    <span className="font-medium">Publica</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {visibility === 'PUBLIC'
                    ? 'Cualquier usuario podra ver y copiar esta rutina'
                    : 'Solo tu podras ver esta rutina'}
                </p>
              </div>
            </div>

            {/* Días de la rutina */}
            <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Días de la rutina</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddDay}>
                  <Plus size={16} style={{ marginRight: '4px' }} />
                  Agregar día
                </Button>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap capitalize border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedDayIndex === index
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-blue-600 hover:text-white'
                    }`}
                    onClick={() => setSelectedDayIndex(index)}
                  >
                    <span>Día {day.dayNumber}</span>
                    {days.length > 1 && (
                      <button
                        type="button"
                        className="p-0.5 rounded hover:bg-white/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDay(index);
                        }}
                        title="Eliminar día"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Day Content */}
              <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="space-y-2">
                  <label htmlFor="dayName" className="block text-sm font-medium text-slate-300">
                    Nombre del día
                  </label>
                  <Input
                    id="dayName"
                    type="text"
                    placeholder="Ej: Push Day, Pull Day, Leg Day..."
                    value={days[selectedDayIndex].dayName}
                    onChange={(e) => handleDayNameChange(selectedDayIndex, e.target.value)}
                    maxLength={50}
                  />
                </div>

                {/* Exercises Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Ejercicios ({days[selectedDayIndex].exercises.length})
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExercisePicker(true)}
                    >
                      <Plus size={16} style={{ marginRight: '4px' }} />
                      Agregar ejercicio
                    </Button>
                  </div>

                  {days[selectedDayIndex].exercises.length === 0 ? (
                    <div className="flex items-center justify-center py-8 px-4 bg-slate-800 rounded-lg border border-slate-700">
                      <p className="text-slate-500 text-sm">No hay ejercicios en este día</p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={days[selectedDayIndex].exercises.map(
                          (ex, i) => ex.id || `new-${i}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {days[selectedDayIndex].exercises.map((exercise, exIndex) => (
                            <SortableExerciseItem
                              key={exercise.id || `new-${exIndex}`}
                              exercise={exercise}
                              index={exIndex}
                              onUpdate={(updates) =>
                                handleUpdateExercise(selectedDayIndex, exIndex, updates)
                              }
                              onRemove={() =>
                                handleRemoveExercise(selectedDayIndex, exIndex)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 flex-shrink-0">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!routineName.trim() || loading}
              loading={loading}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>

        {showExercisePicker && (
          <ExercisePicker
            onSelect={handleAddExercise}
            onClose={() => setShowExercisePicker(false)}
          />
        )}
      </div>
    </div>
  );
}
