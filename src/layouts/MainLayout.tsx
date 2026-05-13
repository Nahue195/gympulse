import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, BarChart3, Ruler, User, Users, Notebook, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../components';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { NotificationBell } from '../components/NotificationBell';

export function MainLayout() {
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const { unreadCount } = useUnreadMessages();

  // Items principales para mobile bottom nav (5 max para pantallas pequeñas)
  const mobileNavItems = [
    { to: '/', label: 'Entreno', icon: Dumbbell },
    { to: '/rutinas', label: 'Rutinas', icon: Notebook },
    { to: '/estadisticas', label: 'Stats', icon: BarChart3 },
    { to: '/comunidad', label: 'Social', icon: Users },
    { to: '/perfil', label: 'Perfil', icon: User },
  ];

  // Items completos para desktop sidebar
  const desktopNavItems = [
    { to: '/', label: 'Entrenamiento', icon: Dumbbell },
    { to: '/rutinas', label: 'Rutinas', icon: Notebook },
    { to: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { to: '/medidas', label: 'Medidas', icon: Ruler },
    { to: '/comunidad', label: 'Comunidad', icon: Users },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircle, badge: unreadCount },
    { to: '/perfil', label: 'Perfil', icon: User },
  ];

  function handleStartRoutine() {
    navigate('/?start=true');
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white">GymPulse</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col pb-16 lg:pb-0">
        {/* Top Header - optimizado para móviles */}
        <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">GymPulse</h2>
            <p className="text-xs sm:text-sm text-slate-400 capitalize truncate">{today}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Botón de mensajes para móvil */}
            <button
              onClick={() => navigate('/mensajes')}
              className="lg:hidden relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <MessageCircle size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationBell />
            <Button onClick={handleStartRoutine} className="text-sm px-3 py-2 sm:px-4 sm:py-2">
              <span className="hidden sm:inline">Comenzar rutina</span>
              <span className="sm:hidden">Entrenar</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation - optimizado para pantallas pequeñas */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-1 py-2 z-50 safe-area-pb">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                isActive
                  ? 'text-blue-500'
                  : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
