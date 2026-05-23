import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, BarChart3, Ruler, User, Users, Notebook, MessageCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { NotificationBell } from '../components/NotificationBell';

const mobileNavItems = [
  { to: '/',             label: 'Entreno',  icon: Dumbbell  },
  { to: '/rutinas',      label: 'Rutinas',  icon: Notebook  },
  { to: '/estadisticas', label: 'Stats',    icon: BarChart3 },
  { to: '/comunidad',    label: 'Social',   icon: Users     },
  { to: '/perfil',       label: 'Perfil',   icon: User      },
];

const desktopNavItems = [
  { to: '/',             label: 'Entrenamiento', icon: Dumbbell    },
  { to: '/rutinas',      label: 'Rutinas',       icon: Notebook    },
  { to: '/estadisticas', label: 'Estadísticas',  icon: BarChart3   },
  { to: '/medidas',      label: 'Medidas',       icon: Ruler       },
  { to: '/comunidad',    label: 'Comunidad',     icon: Users       },
  { to: '/mensajes',     label: 'Mensajes',      icon: MessageCircle },
  { to: '/perfil',       label: 'Perfil',        icon: User        },
];

export function MainLayout() {
  const navigate   = useNavigate();
  const today      = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const { unreadCount } = useUnreadMessages();

  const navWithBadge = desktopNavItems.map(item =>
    item.to === '/mensajes' ? { ...item, badge: unreadCount } : item
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--base)' }}>

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col fixed h-screen z-30"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--acid)', borderRadius: '2px' }}
            >
              <Zap size={16} fill="black" color="black" />
            </div>
            <span
              className="font-display tracking-wide text-xl leading-none"
              style={{ color: 'var(--ink)' }}
            >
              GYM<span style={{ color: 'var(--acid)' }}>PULSE</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p
            className="px-3 pt-1 pb-2 text-[10px] font-condensed font-600 tracking-[0.15em] uppercase"
            style={{ color: 'var(--ink-3)' }}
          >
            Navegación
          </p>
          {navWithBadge.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 transition-all duration-100 relative ${
                  isActive ? 'nav-item-active' : 'nav-item-idle'
                }`
              }
              style={({ isActive }) => ({
                borderRadius: '2px',
                borderLeft: isActive ? '2px solid var(--acid)' : '2px solid transparent',
                background: isActive ? 'var(--acid-dim)' : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={16}
                    style={{ color: isActive ? 'var(--acid)' : 'var(--ink-2)', flexShrink: 0 }}
                  />
                  <span
                    className="font-condensed font-600 text-sm tracking-wide flex-1"
                    style={{ color: isActive ? 'var(--ink)' : 'var(--ink-2)' }}
                  >
                    {item.label}
                  </span>
                  {'badge' in item && item.badge && item.badge > 0 ? (
                    <span
                      className="text-[10px] font-condensed font-700 px-1.5 py-0.5 leading-none"
                      style={{
                        background: 'var(--fire)',
                        color: '#fff',
                        borderRadius: '2px',
                        minWidth: '18px',
                        textAlign: 'center',
                      }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer accent */}
        <div
          className="px-5 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-[10px] font-condensed tracking-widest uppercase" style={{ color: 'var(--ink-3)' }}>
            Track · Improve · Repeat
          </p>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col pb-16 lg:pb-0"
        style={{ marginLeft: 0 }}
      >
        <style>{`@media (min-width: 1024px) { .main-content { margin-left: var(--sidebar-w); } }`}</style>

        {/* Top header */}
        <header
          className="main-content sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--acid)', borderRadius: '2px' }}
            >
              <Zap size={13} fill="black" color="black" />
            </div>
            <span className="font-display text-lg leading-none" style={{ color: 'var(--ink)' }}>
              GYM<span style={{ color: 'var(--acid)' }}>PULSE</span>
            </span>
          </div>

          {/* Desktop: date */}
          <div className="hidden lg:block">
            <p
              className="text-xs font-condensed font-600 tracking-[0.12em] uppercase"
              style={{ color: 'var(--ink-2)' }}
            >
              {today}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mensajes')}
              className="lg:hidden relative p-2 rounded-sm transition-colors"
              style={{ color: 'var(--ink-2)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
            >
              <MessageCircle size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-condensed font-700"
                  style={{ background: 'var(--fire)', color: '#fff', borderRadius: '2px' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationBell />

            <button
              onClick={() => navigate('/?start=true')}
              className="flex items-center gap-2 px-4 py-2 font-condensed font-700 text-xs tracking-widest uppercase transition-all duration-150 hover:-translate-y-px"
              style={{
                background: 'var(--acid)',
                color: '#000',
                borderRadius: '2px',
              }}
            >
              <Dumbbell size={13} />
              <span className="hidden sm:inline">Comenzar rutina</span>
              <span className="sm:hidden">Entrenar</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="main-content flex-1 overflow-auto p-4 sm:p-6"
          style={{ minHeight: 0 }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch safe-area-pb"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-100"
            style={({ isActive }) => ({
              color: isActive ? 'var(--acid)' : 'var(--ink-3)',
              borderTop: isActive ? '2px solid var(--acid)' : '2px solid transparent',
              background: isActive ? 'var(--acid-dim)' : 'transparent',
              marginTop: '-1px',
            })}
          >
            <item.icon size={18} />
            <span className="text-[9px] font-condensed font-600 tracking-wider uppercase">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
