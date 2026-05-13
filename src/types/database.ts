export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          display_name: string
          username: string
          avatar_url: string | null
          gym_goal: string | null
          experience_level: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          username: string
          avatar_url?: string | null
          gym_goal?: string | null
          experience_level?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          username?: string
          avatar_url?: string | null
          gym_goal?: string | null
          experience_level?: string | null
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: string
          equipment: string
          default_unit: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: string
          equipment: string
          default_unit?: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: string
          equipment?: string
          default_unit?: string
          is_public?: boolean
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          routine_name: string
          workout_type: string
          duration_minutes: number | null
          notes: string | null
          visibility: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          routine_name: string
          workout_type: string
          duration_minutes?: number | null
          notes?: string | null
          visibility?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          routine_name?: string
          workout_type?: string
          duration_minutes?: number | null
          notes?: string | null
          visibility?: string
          created_at?: string
        }
      }
      workout_entries: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          exercise_name: string
          sets: number
          reps_per_set: string | null
          weight_per_set: string | null
          unit: string
          rpe: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          exercise_name: string
          sets: number
          reps_per_set?: string | null
          weight_per_set?: string | null
          unit?: string
          rpe?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          exercise_name?: string
          sets?: number
          reps_per_set?: string | null
          weight_per_set?: string | null
          unit?: string
          rpe?: number | null
          created_at?: string
        }
      }
      measures: {
        Row: {
          id: string
          user_id: string
          date: string
          height_cm: number | null
          weight_kg: number
          neck_cm: number | null
          chest_cm: number | null
          waist_cm: number | null
          hip_cm: number | null
          arm_cm: number | null
          thigh_cm: number | null
          body_fat_pct: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          height_cm?: number | null
          weight_kg: number
          neck_cm?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          body_fat_pct?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          height_cm?: number | null
          weight_kg?: number
          neck_cm?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          body_fat_pct?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      gym_checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          status: string
          linked_workout_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          status: string
          linked_workout_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          status?: string
          linked_workout_id?: string | null
          created_at?: string
        }
      }
      routine_templates: {
        Row: {
          id: string
          user_id: string
          day_of_week: string
          template_name: string
          workout_type: string
          default_visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: string
          template_name: string
          workout_type: string
          default_visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: string
          template_name?: string
          workout_type?: string
          default_visibility?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_exercises: {
        Row: {
          id: string
          template_id: string
          exercise_id: string
          exercise_name: string
          order_index: number
          default_sets: number
          default_reps_per_set: string | null
          default_weight_per_set: string | null
          unit: string
          default_rpe: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          exercise_id: string
          exercise_name: string
          order_index: number
          default_sets: number
          default_reps_per_set?: string | null
          default_weight_per_set?: string | null
          unit?: string
          default_rpe?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          exercise_id?: string
          exercise_name?: string
          order_index?: number
          default_sets?: number
          default_reps_per_set?: string | null
          default_weight_per_set?: string | null
          unit?: string
          default_rpe?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content_text: string | null
          image_urls: string[] | null
          post_type: string
          shared_workout_id: string | null
          visibility: string
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_text?: string | null
          image_urls?: string[] | null
          post_type?: string
          shared_workout_id?: string | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_text?: string | null
          image_urls?: string[] | null
          post_type?: string
          shared_workout_id?: string | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          comment_text: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          comment_text: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
