import { useState, useEffect, useRef } from 'react';
import { X, Plus, Check, Timer, Dumbbell, Trophy, Clock, ChevronDown, Square, CheckSquare, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from '../types';
import { Button } from './Button';
import { ExercisePicker } from './ExercisePicker';
import type { Exercise } from '../types';

interface WorkoutSessionProps {
  session: WorkoutSession;
  onUpdateSession: (session: WorkoutSession) => void;
  onFinish: (session: WorkoutSession) => void;
  onCancel: () => void;
}

interface LastPerformance {
  weight: number;
  reps: number;
  weights: number[];
  repsArray: number[];
  date: string;
}

// ============================================
// SetRow Component - Individual set with checkbox
// ============================================
interface SetRowProps {
  set: WorkoutSessionSet;
  setIndex: number;
  isCompleted: boolean;
  onToggleComplete: (setIndex: number, weight: number, reps: number) => void;
  onUpdateSet: (setIndex: number, weight: number, reps: number) => void;
  onDeleteSet: (setIndex: number) => void;
}

function SetRow({ set, setIndex, isCompleted, onToggleComplete, onUpdateSet }: SetRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(set.weightKg);
  const [editReps, setEditReps] = useState(set.reps);
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditWeight(set.weightKg);
    setEditReps(set.reps);
  }, [set.weightKg, set.reps]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      // Si está editando, guardar los valores editados y marcar como completado
      onToggleComplete(setIndex, editWeight, editReps);
      setIsEditing(false);
    } else {
      onToggleComplete(setIndex, set.weightKg, set.reps);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateSet(setIndex, editWeight, editReps);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditWeight(set.weightKg);
      setEditReps(set.reps);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
        isCompleted
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckboxClick}
        className={`flex-shrink-0 transition-colors ${
          isCompleted ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        {isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
      </button>

      {/* Set number */}
      <span className={`text-sm font-medium w-16 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
        Serie {setIndex + 1}
      </span>

      {/* Weight and Reps */}
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            ref={weightInputRef}
            type="number"
            step="0.5"
            value={editWeight}
            onChange={(e) => setEditWeight(parseFloat(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            className="w-16 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-500 text-sm">kg ×</span>
          <input
            type="number"
            value={editReps}
            onChange={(e) => setEditReps(parseInt(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            className="w-14 px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSaveEdit}
            className="p-1 text-emerald-500 hover:text-emerald-400"
          >
            <Check size={18} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleStartEdit}
          className={`flex items-center gap-1 flex-1 cursor-pointer group ${
            isCompleted ? 'text-emerald-300' : 'text-white'
          }`}
        >
          <span className="font-medium">{set.weightKg}kg</span>
          <span className="text-slate-500">×</span>
          <span className="font-medium">{set.reps}</span>
          <Edit3 size={14} className="ml-2 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <Check size={16} className="text-emerald-500 flex-shrink-0" />
      )}
    </div>
  );
}

// ============================================
// ExerciseCard Component - Expandable card per exercise
// ============================================
interface ExerciseCardProps {
  exercise: WorkoutSessionExercise;
  exerciseIndex: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSetComplete: (setIndex: number, weight: number, reps: number) => void;
  onUpdateSet: (setIndex: number, weight: number, reps: number) => void;
  onDeleteSet: (setIndex: number) => void;
  onAddSet: () => void;
  lastPerformance?: LastPerformance;
}

function ExerciseCard({
  exercise,
  isExpanded,
  onToggleExpand,
  onToggleSetComplete,
  onUpdateSet,
  onDeleteSet,
  onAddSet,
  lastPerformance
}: ExerciseCardProps) {
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;
  const allCompleted = completedSets === totalSets && totalSets > 0;

  return (
    <div className={`bg-slate-800 rounded-xl overflow-hidden border transition-all ${
      allCompleted ? 'border-emerald-500/50' : 'border-slate-700'
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <div className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown size={20} className="text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${allCompleted ? 'text-emerald-400' : 'text-white'}`}>
            {exercise.exerciseName}
          </h3>
          <p className="text-xs text-slate-500">{exercise.muscleGroup}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            allCompleted ? 'text-emerald-400' : completedSets > 0 ? 'text-blue-400' : 'text-slate-500'
          }`}>
            {completedSets}/{totalSets}
          </span>
          {allCompleted && <Check size={18} className="text-emerald-500" />}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Last performance hint */}
          {lastPerformance && (
            <div className="bg-slate-700/50 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-slate-500">ÚLTIMA VEZ ({lastPerformance.date})</p>
              <p className="text-sm text-slate-400">
                {lastPerformance.weights.map((w, i) => `${w}kg×${lastPerformance.repsArray[i]}`).join(' → ')}
              </p>
            </div>
          )}

          {/* Sets list */}
          {exercise.sets.map((set, setIndex) => (
            <SetRow
              key={setIndex}
              set={set}
              setIndex={setIndex}
              isCompleted={set.completed}
              onToggleComplete={onToggleSetComplete}
              onUpdateSet={onUpdateSet}
              onDeleteSet={onDeleteSet}
            />
          ))}

          {/* Add set button */}
          <button
            onClick={onAddSet}
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors text-sm"
          >
            <Plus size={16} />
            Agregar serie
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main WorkoutSession Component
// ============================================
export function WorkoutSessionComponent({ session, onUpdateSession, onFinish, onCancel }: WorkoutSessionProps) {
  const { user } = useAuth();
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set([0]));
  const [lastPerformance, setLastPerformance] = useState<{ [key: string]: LastPerformance }>({});
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Rest timer - use user's configured rest timer or default to 90 seconds
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const restTargetSeconds = user?.restTimerSeconds ?? 90;

  // Initialize sets for all exercises on mount
  useEffect(() => {
    if (hasInitialized) return;

    const initializeSets = async () => {
      // Load last performance for all exercises first
      const performancePromises = session.exercises.map(ex => loadLastPerformance(ex.exerciseId));
      const performances = await Promise.all(performancePromises);

      const performanceMap: { [key: string]: LastPerformance } = {};
      session.exercises.forEach((ex, idx) => {
        if (performances[idx]) {
          performanceMap[ex.exerciseId] = performances[idx]!;
        }
      });
      setLastPerformance(performanceMap);

      // Pre-generate sets for exercises that don't have any
      const updatedExercises = session.exercises.map(exercise => {
        if (exercise.sets.length > 0) return exercise;

        const numSets = exercise.routineSets || 3;
        const perf = performanceMap[exercise.exerciseId];

        const newSets: WorkoutSessionSet[] = [];
        for (let i = 0; i < numSets; i++) {
          let weight = exercise.routineWeight || 0;
          let reps = exercise.routineReps || 10;

          // Use last performance if available
          if (perf) {
            weight = perf.weights[i] ?? perf.weights[perf.weights.length - 1] ?? weight;
            reps = perf.repsArray[i] ?? perf.repsArray[perf.repsArray.length - 1] ?? reps;
          }

          newSets.push({
            setNumber: i + 1,
            weightKg: weight,
            reps: reps,
            completed: false
          });
        }

        return { ...exercise, sets: newSets };
      });

      if (JSON.stringify(updatedExercises) !== JSON.stringify(session.exercises)) {
        onUpdateSession({ ...session, exercises: updatedExercises });
      }

      // Expand all exercises that have incomplete sets
      const toExpand = new Set<number>();
      updatedExercises.forEach((ex, idx) => {
        if (ex.sets.some(s => !s.completed)) {
          toExpand.add(idx);
        }
      });
      if (toExpand.size === 0 && updatedExercises.length > 0) {
        toExpand.add(0);
      }
      setExpandedExercises(toExpand);

      setHasInitialized(true);
    };

    initializeSets();
  }, [session.exercises, hasInitialized]);

  // Elapsed time timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime.getTime()) / 60000);
      setElapsedMinutes(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer !== null) {
      const interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev >= restTargetSeconds) {
            playSound();
            clearInterval(interval);
            setRestTimer(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer, restTargetSeconds]);

  function playSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  async function loadLastPerformance(exerciseId: string): Promise<LastPerformance | null> {
    try {
      const { data: entries, error } = await supabase
        .from('workout_entries')
        .select('*, workouts!inner(date, user_id)')
        .eq('exercise_id', exerciseId)
        .eq('workouts.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1) as { data: any[] | null; error: any };

      if (error) throw error;

      if (entries && entries.length > 0) {
        const entry = entries[0];
        const weights = entry.weight_per_set ? entry.weight_per_set.split(',').map(Number) : [0];
        const repsArray = entry.reps_per_set ? entry.reps_per_set.split(',').map(Number) : [10];

        return {
          weight: weights[0] || 0,
          reps: repsArray[0] || 10,
          weights,
          repsArray,
          date: new Date(entry.workouts.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading last performance:', error);
      return null;
    }
  }

  function startRestTimer() {
    setRestTimer(Date.now());
    setRestSeconds(0);
  }

  function cancelRestTimer() {
    setRestTimer(null);
    setRestSeconds(0);
  }

  function toggleExerciseExpanded(index: number) {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }

  function handleToggleSetComplete(exerciseIndex: number, setIndex: number, weight: number, reps: number) {
    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    const set = exercise.sets[setIndex];

    const wasCompleted = set.completed;
    exercise.sets[setIndex] = {
      ...set,
      weightKg: weight,
      reps: reps,
      completed: !wasCompleted
    };

    onUpdateSession({ ...session, exercises: updatedExercises });

    // Auto-start rest timer when completing a set (not when uncompleting)
    if (!wasCompleted) {
      startRestTimer();
    }
  }

  function handleUpdateSet(exerciseIndex: number, setIndex: number, weight: number, reps: number) {
    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    exercise.sets[setIndex] = {
      ...exercise.sets[setIndex],
      weightKg: weight,
      reps: reps
    };
    onUpdateSession({ ...session, exercises: updatedExercises });
  }

  function handleDeleteSet(exerciseIndex: number, setIndex: number) {
    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    exercise.sets.splice(setIndex, 1);
    // Renumber sets
    exercise.sets.forEach((set, idx) => {
      set.setNumber = idx + 1;
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  }

  function handleAddSet(exerciseIndex: number) {
    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];

    // Get values from last set or defaults
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const perf = lastPerformance[exercise.exerciseId];

    let weight = lastSet?.weightKg ?? perf?.weight ?? exercise.routineWeight ?? 0;
    let reps = lastSet?.reps ?? perf?.reps ?? exercise.routineReps ?? 10;

    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      weightKg: weight,
      reps: reps,
      completed: false
    });

    onUpdateSession({ ...session, exercises: updatedExercises });
  }

  async function addExercise(exercise: Exercise) {
    // Load last performance for the new exercise
    const perf = await loadLastPerformance(exercise.id);
    if (perf) {
      setLastPerformance(prev => ({ ...prev, [exercise.id]: perf }));
    }

    const numSets = 3; // Default for added exercises
    const newSets: WorkoutSessionSet[] = [];

    for (let i = 0; i < numSets; i++) {
      let weight = 0;
      let reps = 10;

      if (perf) {
        weight = perf.weights[i] ?? perf.weights[perf.weights.length - 1] ?? 0;
        reps = perf.repsArray[i] ?? perf.repsArray[perf.repsArray.length - 1] ?? 10;
      }

      newSets.push({
        setNumber: i + 1,
        weightKg: weight,
        reps: reps,
        completed: false
      });
    }

    const newExercise: WorkoutSessionExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: newSets,
      notes: ''
    };

    const updatedSession = {
      ...session,
      exercises: [...session.exercises, newExercise]
    };

    onUpdateSession(updatedSession);
    setShowExercisePicker(false);

    // Expand the new exercise
    setExpandedExercises(prev => new Set([...prev, updatedSession.exercises.length - 1]));
  }

  // Calculate totals
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalCompletedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
    0
  );

  const totalVolume = session.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => {
      if (set.completed) {
        return setSum + (set.weightKg * set.reps);
      }
      return setSum;
    }, 0);
  }, 0);

  const progressPercent = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;
  const restProgress = restTimer !== null ? (restSeconds / restTargetSeconds) * 100 : 0;

  // Show completion screen
  if (showCompletionScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-[env(safe-area-inset-top)] text-center overflow-y-auto">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Trophy size={32} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">¡Entrenamiento Completo!</h1>
          <p className="text-slate-400 text-sm mb-6">Excelente trabajo</p>

          <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6">
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{elapsedMinutes}</p>
              <p className="text-[10px] text-slate-400">minutos</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{totalCompletedSets}</p>
              <p className="text-[10px] text-slate-400">series</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{Math.round(totalVolume)}</p>
              <p className="text-[10px] text-slate-400">kg total</p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-1.5 mb-4">
            <h3 className="text-xs font-bold text-slate-400 text-left">EJERCICIOS</h3>
            {session.exercises.filter(ex => ex.sets.some(s => s.completed)).map((ex, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800 rounded-lg p-2.5">
                <span className="text-white font-medium text-sm truncate flex-1 mr-2">{ex.exerciseName}</span>
                <span className="text-emerald-400 text-xs flex-shrink-0">
                  {ex.sets.filter(s => s.completed).length} series
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2 max-w-sm mx-auto">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowCompletionScreen(false)}
            >
              Volver
            </Button>
            <Button
              size="md"
              fullWidth
              onClick={() => onFinish(session)}
              disabled={totalCompletedSets === 0}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No exercises yet
  if (session.exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col">
        <div className="bg-slate-800 border-b border-slate-700 px-3 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <h1 className="text-base font-bold text-white truncate">
              {session.routineName || 'Entrenamiento Rápido'}
            </h1>
            {session.dayName && (
              <p className="text-xs text-slate-400 truncate">{session.dayName}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Dumbbell size={48} className="text-slate-600 mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Empezá tu entrenamiento</h2>
          <p className="text-slate-400 text-sm mb-5 text-center">Agregá el primer ejercicio</p>
          <Button size="md" onClick={() => setShowExercisePicker(true)}>
            <Plus size={18} />
            Agregar Ejercicio
          </Button>
        </div>

        {showExercisePicker && (
          <ExercisePicker
            onSelect={addExercise}
            onClose={() => setShowExercisePicker(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col">
      {/* Header - con safe area para notch */}
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex-1 min-w-0 mr-2">
            <h1 className="text-base font-bold text-white truncate">
              {session.routineName || 'Entrenamiento Rápido'}
            </h1>
            {session.dayName && (
              <p className="text-[11px] text-slate-400 truncate">{session.dayName}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
              <Clock size={12} />
              <span className="text-xs font-bold">{elapsedMinutes}m</span>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {totalCompletedSets}/{totalSets}
          </span>
        </div>
      </div>

      {/* Rest Timer Banner - compacto */}
      {restTimer !== null && (
        <div className="bg-blue-600 px-3 py-2 border-b border-blue-500 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Timer size={16} className="text-white" />
              <span className="text-white font-bold text-sm">
                {restTargetSeconds - restSeconds}s
              </span>
            </div>
            <button
              onClick={cancelRestTimer}
              className="text-[11px] text-white/80 hover:text-white px-2 py-0.5 rounded bg-white/10"
            >
              Saltar
            </button>
          </div>
          <div className="h-1 bg-blue-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000"
              style={{ width: `${restProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Scrollable Exercise List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {session.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={exerciseIndex}
            exercise={exercise}
            exerciseIndex={exerciseIndex}
            isExpanded={expandedExercises.has(exerciseIndex)}
            onToggleExpand={() => toggleExerciseExpanded(exerciseIndex)}
            onToggleSetComplete={(setIndex, weight, reps) =>
              handleToggleSetComplete(exerciseIndex, setIndex, weight, reps)
            }
            onUpdateSet={(setIndex, weight, reps) =>
              handleUpdateSet(exerciseIndex, setIndex, weight, reps)
            }
            onDeleteSet={(setIndex) => handleDeleteSet(exerciseIndex, setIndex)}
            onAddSet={() => handleAddSet(exerciseIndex)}
            lastPerformance={lastPerformance[exercise.exerciseId]}
          />
        ))}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors text-sm"
        >
          <Plus size={18} />
          Agregar ejercicio
        </button>
      </div>

      {/* Bottom Bar - optimizado para móviles pequeños */}
      <div className="bg-slate-800 border-t border-slate-700 p-3 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] flex-shrink-0">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {/* Rest Timer Button */}
          <button
            onClick={restTimer !== null ? cancelRestTimer : startRestTimer}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
              restTimer !== null
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Timer size={20} />
          </button>

          {/* Finish Button */}
          <Button
            size="md"
            fullWidth
            onClick={() => setShowCompletionScreen(true)}
            disabled={totalCompletedSets === 0}
            className="!py-3"
          >
            Finalizar Entrenamiento
          </Button>
        </div>
      </div>

      {/* Exercise Picker */}
      {showExercisePicker && (
        <ExercisePicker
          onSelect={addExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}
