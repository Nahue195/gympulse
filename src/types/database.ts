export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums (ver supabase/migrations/0008_notifications.sql)
export type NotificationType = 'NEW_FOLLOWER' | 'POST_LIKE' | 'POST_COMMENT' | 'NEW_MESSAGE'
export type ReferenceType = 'post' | 'comment' | 'conversation' | 'follow'

// Nutrition enums (ver supabase/migrations/0014_nutrition_schema.sql)
export type FoodCategory =
  | 'proteins' | 'carbs' | 'vegetables' | 'fruits' | 'dairy'
  | 'fats' | 'beverages' | 'snacks' | 'prepared' | 'other'
export type MealType = 'breakfast' | 'lunch' | 'merienda' | 'dinner' | 'snack'
export type DietType = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegetarian' | 'vegan'

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
          rest_timer_seconds: number
          training_days: number[] | null
          followers_count: number
          following_count: number
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          username: string
          avatar_url?: string | null
          gym_goal?: string | null
          experience_level?: string | null
          rest_timer_seconds?: number
          training_days?: number[] | null
          followers_count?: number
          following_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          username?: string
          avatar_url?: string | null
          gym_goal?: string | null
          experience_level?: string | null
          rest_timer_seconds?: number
          training_days?: number[] | null
          followers_count?: number
          following_count?: number
          created_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: string
          equipment: string | null
          default_unit: string
          is_public: boolean
          is_custom: boolean
          category: string | null
          description: string | null
          user_id: string | null
          tracking_type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: string
          equipment?: string | null
          default_unit?: string
          is_public?: boolean
          is_custom?: boolean
          category?: string | null
          description?: string | null
          user_id?: string | null
          tracking_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: string
          equipment?: string | null
          default_unit?: string
          is_public?: boolean
          is_custom?: boolean
          category?: string | null
          description?: string | null
          user_id?: string | null
          tracking_type?: string
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          user_id: string
          routine_name: string
          description: string | null
          workout_type: string
          total_days: number
          is_active: boolean
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_name: string
          description?: string | null
          workout_type?: string
          total_days?: number
          is_active?: boolean
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_name?: string
          description?: string | null
          workout_type?: string
          total_days?: number
          is_active?: boolean
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_days: {
        Row: {
          id: string
          routine_id: string
          day_number: number
          day_name: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          day_number: number
          day_name: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          day_number?: number
          day_name?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          id: string
          routine_day_id: string
          exercise_id: string
          exercise_name: string
          order_index: number
          sets: number
          reps: number
          weight_kg: number | null
          rest_seconds: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          routine_day_id: string
          exercise_id: string
          exercise_name: string
          order_index?: number
          sets?: number
          reps?: number
          weight_kg?: number | null
          rest_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          routine_day_id?: string
          exercise_id?: string
          exercise_name?: string
          order_index?: number
          sets?: number
          reps?: number
          weight_kg?: number | null
          rest_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          last_message_at?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          actor_id: string
          reference_id: string | null
          reference_type: ReferenceType | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          actor_id: string
          reference_id?: string | null
          reference_type?: ReferenceType | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          actor_id?: string
          reference_id?: string | null
          reference_type?: ReferenceType | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: FoodCategory
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number | null
          sugar: number | null
          sodium: number | null
          is_custom: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category?: FoodCategory
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category?: FoodCategory
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      meal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          meal_type: MealType
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          meal_type: MealType
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal_type?: MealType
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      meal_items: {
        Row: {
          id: string
          meal_entry_id: string
          food_id: string
          quantity: number
          calories: number
          protein: number
          carbs: number
          fat: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_entry_id: string
          food_id: string
          quantity?: number
          calories: number
          protein: number
          carbs: number
          fat: number
          created_at?: string
        }
        Update: {
          id?: string
          meal_entry_id?: string
          food_id?: string
          quantity?: number
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          created_at?: string
        }
        Relationships: []
      }
      user_nutrition_goals: {
        Row: {
          id: string
          user_id: string
          daily_calories: number
          protein_percentage: number
          carbs_percentage: number
          fat_percentage: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calories?: number
          protein_percentage?: number
          carbs_percentage?: number
          fat_percentage?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calories?: number
          protein_percentage?: number
          carbs_percentage?: number
          fat_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      duplicate_routine: {
        Args: { p_routine_id: string; p_new_name: string }
        Returns: string
      }
      clone_public_routine: {
        Args: { p_routine_id: string; p_user_id: string }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { p_user_1: string; p_user_2: string }
        Returns: string
      }
    }
    Enums: {
      notification_type: NotificationType
      reference_type: ReferenceType
      food_category: FoodCategory
      meal_type: MealType
      diet_type: DietType
    }
  }
}
