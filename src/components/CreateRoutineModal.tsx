import { useState } from 'react';
import { X, Plus, Trash2, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { WorkoutType, Exercise, RoutineExercise, RoutineVisibility } from '../types';
import { Button, Input } from './';
import { ExercisePicker } from './ExercisePicker';

interface CreateRoutineModalProps {
  onClose: () => void;
  onCreated: () => void;
}

interface DayData {
  dayNumber: number;
  dayName: string;
  exercises: Omit<RoutineExercise, 'id' | 'routineDayId' | 'createdAt'>[];
}

export function CreateRoutineModal({ onClose, onCreated }: CreateRoutineModalProps) {
  const { user } = useAuth();
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Fuerza');
  const [visibility, setVisibility] = useState<RoutineVisibility>('PRIVATE');
  const [totalDays, setTotalDays] = useState(3);
  const [days, setDays] = useState<DayData[]>([
    { dayNumber: 1, dayName: 'Día 1', exercises: [] },
    { dayNumber: 2, dayName: 'Día 2', exercises: [] },
    { dayNumber: 3, dayName: 'Día 3', exercises: [] },
  ]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleAddDay() {
    const newDayNumber = days.length + 1;
    setDays([...days, { dayNumber: newDayNumber, dayName: `Día ${newDayNumber}`, exercises: [] }]);
    setTotalDays(newDayNumber);
  }

  function handleRemoveDay(index: number) {
    if (days.length <= 1) {
      alert('Debe haber al menos un día en la rutina');
      return;
    }
    const newDays = days.filter((_, i) => i !== index);
    const renumberedDays = newDays.map((day, i) => ({ ...day, dayNumber: i + 1 }));
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
    const newExercise: Omit<RoutineExercise, 'id' | 'routineDayId' | 'createdAt'> = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex: days[selectedDayIndex].exercises.length,
      sets: 3,
      reps: 10,
      weightKg: null,
      restSeconds: null,
      notes: null
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

      const { data: routineData, error: routineError } = await (supabase
        .from('routines') as any)
        .insert({
          user_id: user.id,
          routine_name: routineName.trim(),
          description: description.trim() || null,
          workout_type: workoutType,
          total_days: totalDays,
          is_active: true,
          visibility: visibility
        })
        .select()
        .single();

      if (routineError) throw routineError;

      for (const day of days) {
        const { data: dayData, error: dayError } = await (supabase
          .from('routine_days') as any)
          .insert({
            routine_id: routineData.id,
            day_number: day.dayNumber,
            day_name: day.dayName,
            notes: null
          })
          .select()
          .single();

        if (dayError) throw dayError;

        if (day.exercises.length > 0) {
          const exercisesToInsert = day.exercises.map(ex => ({
            routine_day_id: dayData.id,
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            order_index: ex.orderIndex,
            sets: ex.sets,
            reps: ex.reps,
            weight_kg: ex.weightKg,
            rest_seconds: ex.restSeconds,
            notes: ex.notes
          }));

          const { error: exercisesError } = await (supabase
            .from('routine_exercises') as any)
            .insert(exercisesToInsert);

          if (exercisesError) throw exercisesError;
        }
      }

      onCreated();
    } catch (error) {
      console.error('Error creating routine:', error);
      alert('Error al crear la rutina');
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
          <h2 className="text-xl font-bold text-white">Nueva Rutina</h2>
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
                    <div className="space-y-2">
                      {days[selectedDayIndex].exercises.map((exercise, exIndex) => (
                        <div
                          key={exIndex}
                          className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold flex-shrink-0">
                              {exIndex + 1}
                            </span>
                            <span className="font-semibold text-white flex-1">{exercise.exerciseName}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex flex-col gap-1 min-w-[80px]">
                              <label className="text-xs text-slate-400 font-medium">Sets</label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={exercise.sets}
                                onChange={(e) =>
                                  handleUpdateExercise(selectedDayIndex, exIndex, {
                                    sets: Number(e.target.value)
                                  })
                                }
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
                                onChange={(e) =>
                                  handleUpdateExercise(selectedDayIndex, exIndex, {
                                    reps: Number(e.target.value)
                                  })
                                }
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
                                onChange={(e) =>
                                  handleUpdateExercise(selectedDayIndex, exIndex, {
                                    weightKg: e.target.value ? Number(e.target.value) : null
                                  })
                                }
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            <button
                              type="button"
                              className="ml-auto p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                              onClick={() => handleRemoveExercise(selectedDayIndex, exIndex)}
                              title="Eliminar ejercicio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
              Crear Rutina
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
