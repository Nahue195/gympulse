export * from './notifications';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type GymGoal = 'strength' | 'hypertrophy' | 'weight_loss' | 'endurance' | 'general_fitness';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'other';
export type WorkoutType = 'Fuerza' | 'Cardio' | 'Híbrido' | 'Movilidad' | 'Otro';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
export type CheckinStatus = 'WENT' | 'SKIPPED';
export type Unit = 'kg' | 'lb';

export interface User {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  gymGoal?: GymGoal | null;
  experienceLevel?: ExperienceLevel | null;
  restTimerSeconds?: number;
  trainingDays?: number[]; // 1=Lunes, 2=Martes, ..., 6=Sábado (sin domingo)
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment?: string | null;
  description?: string | null;
  isCustom: boolean;
  userId?: string | null;
  createdAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  routineName: string;
  workoutType: WorkoutType;
  durationMinutes?: number | null;
  notes?: string | null;
  visibility: Visibility;
  createdAt: string;
}

export interface WorkoutEntry {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsPerSet?: string | null;
  weightPerSet?: string | null;
  unit: Unit;
  rpe?: number | null;
  createdAt: string;
}

export interface Measure {
  id: string;
  userId: string;
  date: string;
  heightCm?: number | null;
  weightKg: number;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  bodyFatPct?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface GymCheckin {
  id: string;
  userId: string;
  date: string;
  status: CheckinStatus;
  linkedWorkoutId?: string | null;
  createdAt: string;
}

// Nuevo sistema de rutinas
export type RoutineVisibility = 'PUBLIC' | 'PRIVATE';

export interface Routine {
  id: string;
  userId: string;
  routineName: string;
  description?: string | null;
  workoutType: WorkoutType;
  totalDays: number; // Numero de dias que tiene la rutina (ej: 3, 5, 6)
  isActive: boolean;
  visibility?: RoutineVisibility;
  originalRoutineId?: string | null;
  cloneCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDay {
  id: string;
  routineId: string;
  dayNumber: number; // 1, 2, 3, etc.
  dayName: string; // "Push Day", "Pull Day", "Leg Day", etc.
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineExercise {
  id: string;
  routineDayId: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  sets: number;
  reps: number;
  weightKg?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
  createdAt: string;
}

// Extended types for UI with joined data
export interface WorkoutWithEntries extends Workout {
  entries: WorkoutEntry[];
  user?: User;
}

export interface FeedItem {
  id: string;
  user: User;
  checkin: GymCheckin;
  workout?: WorkoutWithEntries | null;
}

// Extended types for Routines UI
export interface RoutineDayWithExercises extends RoutineDay {
  exercises: RoutineExercise[];
}

export interface RoutineWithDays extends Routine {
  days: RoutineDayWithExercises[];
  totalExercises: number;
  user?: User;
}

// Community types
export type PostType = 'TEXT' | 'IMAGE' | 'WORKOUT_SHARE';

export interface Post {
  id: string;
  userId: string;
  contentText?: string | null;
  imageUrls?: string[] | null;
  postType: PostType;
  sharedWorkoutId?: string | null;
  visibility: Visibility;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  commentText: string;
  createdAt: string;
}

// Extended types for Community UI
export interface PostWithUser extends Post {
  user: User;
  sharedWorkout?: WorkoutWithEntries | null;
  hasLiked?: boolean;
}

export interface PostCommentWithUser extends PostComment {
  user: User;
}

// Follow system types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface UserWithFollowStatus extends User {
  isFollowing?: boolean;
}

// Direct messaging types
export interface Conversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string | null;
  createdAt: string;
}

export interface ConversationWithUser extends Conversation {
  otherUser: User;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MessageWithUser extends Message {
  sender: User;
}

// Active workout session types
export interface WorkoutSessionExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: WorkoutSessionSet[];
  notes?: string;
  // Valores sugeridos de la rutina (si aplica)
  routineSets?: number;
  routineReps?: number;
  routineWeight?: number;
}

export interface WorkoutSessionSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number;
}

export interface WorkoutSession {
  routineId?: string;
  routineName?: string;
  dayNumber?: number;
  dayName?: string;
  startTime: Date;
  exercises: WorkoutSessionExercise[];
  notes?: string;
}
