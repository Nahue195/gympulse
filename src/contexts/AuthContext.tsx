import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId: string, retries = 3) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading user profile:', error);
        }
        setLoading(false);
        return;
      }

      if (data) {
        const userData = data as any;
        setUser({
          id: userData.id,
          displayName: userData.display_name,
          username: userData.username,
          avatarUrl: userData.avatar_url,
          gymGoal: userData.gym_goal,
          experienceLevel: userData.experience_level,
          restTimerSeconds: userData.rest_timer_seconds ?? 90,
          trainingDays: userData.training_days ?? [1, 3, 5], // Default: Lun, Mié, Vie
          followersCount: userData.followers_count ?? 0,
          followingCount: userData.following_count ?? 0,
          createdAt: userData.created_at,
        });
        setLoading(false);
      } else if (retries > 0) {
        // Si no hay datos, el trigger puede estar ejecutándose aún
        // Solo mostrar logs en desarrollo
        if (import.meta.env.DEV && retries === 3) {
          console.log('Cargando perfil de usuario...');
        }
        setTimeout(() => loadUserProfile(userId, retries - 1), 1000);
      } else {
        // Después de múltiples reintentos, el perfil no existe
        // Cerrar sesión automáticamente
        console.warn('No se encontró el perfil del usuario. Por favor vuelve a registrarte.');
        await supabase.auth.signOut();
        setUser(null);
        setSupabaseUser(null);
        setSession(null);
        setLoading(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading user profile:', error);
      }
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, displayName: string, username: string) {
    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Sign up with Supabase Auth
      // El trigger de la base de datos creará automáticamente el perfil del usuario
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            username: username,
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse');
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const dbUpdates: any = {};
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.gymGoal !== undefined) dbUpdates.gym_goal = updates.gymGoal;
      if (updates.experienceLevel !== undefined) dbUpdates.experience_level = updates.experienceLevel;
      if (updates.restTimerSeconds !== undefined) dbUpdates.rest_timer_seconds = updates.restTimerSeconds;
      if (updates.trainingDays !== undefined) dbUpdates.training_days = updates.trainingDays;

      const { error } = await (supabase
        .from('users') as any)
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar el perfil');
    }
  }

  async function refreshUser() {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser.id);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (error: any) {
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  }

  const value = {
    user,
    supabaseUser,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
