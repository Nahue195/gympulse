import { useState, useEffect } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, ActivityTracker } from '../components';
import { LogOut, Settings, Camera } from 'lucide-react';
import { SettingsModal } from '../components/SettingsModal';
import { AvatarUpload } from '../components/AvatarUpload';
import { supabase } from '../lib/supabase';

export function Profile() {
  const { user, signOut, refreshUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user]);

  async function loadActivityData() {
    try {
      // Cargar fechas de workouts del mes actual
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('date')
        .eq('user_id', user!.id)
        .gte('date', monthStart);

      if (workoutsData) {
        setWorkoutDates(workoutsData.map((w: any) => w.date));
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">Perfil</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-0.5">Tu progreso</p>
        </div>
        <Button variant="secondary" onClick={() => setShowSettings(true)} className="text-sm px-3 py-2">
          <Settings size={18} />
          <span className="hidden sm:inline ml-2">Configuración</span>
        </Button>
      </div>

      <Card padding="sm" className="sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user?.displayName?.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => setShowAvatarUpload(true)}
              className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors shadow-lg"
            >
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{user?.displayName}</h2>
            <p className="text-slate-400 text-sm truncate">@{user?.username}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm">
              <span className="text-slate-400">
                <span className="font-bold text-white">{user?.followersCount ?? 0}</span> seguidores
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{user?.followingCount ?? 0}</span> siguiendo
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Tracker - Mes actual */}
      <ActivityTracker
        workoutDates={workoutDates}
        trainingDays={user?.trainingDays ?? [1, 3, 5]}
      />

      <Button
        variant="danger"
        onClick={handleSignOut}
        fullWidth
      >
        <LogOut size={20} />
        Cerrar sesion
      </Button>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showAvatarUpload && (
        <AvatarUpload
          onClose={() => setShowAvatarUpload(false)}
          onUpdated={() => refreshUser()}
        />
      )}
    </div>
  );
}
