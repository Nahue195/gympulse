import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Dumbbell, BarChart3, Users } from 'lucide-react';

const features = [
  { icon: Dumbbell,  label: 'Entrenamiento',   desc: 'Registrá cada sesión en tiempo real' },
  { icon: BarChart3, label: 'Estadísticas',     desc: 'Visualizá tu progreso semana a semana' },
  { icon: Users,     label: 'Comunidad',        desc: 'Conectá con otros atletas' },
];

export function Auth() {
  const [isLogin, setIsLogin]           = useState(true);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [displayName, setDisplayName]   = useState('');
  const [username, setUsername]         = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const { signIn, signUp }              = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!displayName || !username) throw new Error('Completá todos los campos');
        await signUp(email, password, displayName, username);
        setSuccess('¡Registro exitoso! Iniciando sesión...');
        setTimeout(() => {
          signIn(email, password).catch(() => {
            setSuccess('');
            setError('Registro exitoso. Iniciá sesión manualmente.');
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--base)' }}
    >
      {/* ── Left panel (branding) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[44%] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            opacity: 0.4,
          }}
        />

        {/* Large decorative number */}
        <div
          className="absolute -bottom-8 -right-4 font-display text-[22rem] leading-none select-none pointer-events-none"
          style={{ color: 'var(--border)', opacity: 0.6 }}
        >
          GP
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ background: 'var(--acid)', borderRadius: '2px' }}
            >
              <Zap size={20} fill="black" color="black" />
            </div>
            <span className="font-display text-3xl tracking-wide leading-none" style={{ color: 'var(--ink)' }}>
              GYM<span style={{ color: 'var(--acid)' }}>PULSE</span>
            </span>
          </div>
          <p
            className="mt-4 text-sm font-condensed font-500 tracking-[0.12em] uppercase"
            style={{ color: 'var(--ink-2)' }}
          >
            Track · Improve · Repeat
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4">
              <div
                className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--acid-dim)', border: '1px solid var(--border-2)', borderRadius: '2px' }}
              >
                <Icon size={16} style={{ color: 'var(--acid)' }} />
              </div>
              <div>
                <p className="font-condensed font-700 tracking-wide text-sm" style={{ color: 'var(--ink)' }}>
                  {label}
                </p>
                <p className="text-sm" style={{ color: 'var(--ink-2)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p
          className="relative z-10 text-xs font-condensed tracking-widest uppercase"
          style={{ color: 'var(--ink-3)' }}
        >
          © 2025 GymPulse
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'var(--acid)', borderRadius: '2px' }}
          >
            <Zap size={18} fill="black" color="black" />
          </div>
          <span className="font-display text-2xl tracking-wide leading-none" style={{ color: 'var(--ink)' }}>
            GYM<span style={{ color: 'var(--acid)' }}>PULSE</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-slideUp">

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="font-condensed font-800 text-3xl tracking-wide"
              style={{ color: 'var(--ink)' }}
            >
              {isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
              {isLogin
                ? 'Ingresá tus datos para continuar'
                : 'Empezá a trackear tu progreso hoy'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Field
                  label="Nombre completo"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
                <Field
                  label="Usuario"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="juanperez"
                  required
                />
              </>
            )}

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Field
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div
                className="p-3 text-sm font-condensed"
                style={{
                  background: 'var(--fire-dim)',
                  border: '1px solid var(--fire)',
                  borderRadius: '2px',
                  color: 'var(--fire)',
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="p-3 text-sm font-condensed"
                style={{
                  background: 'var(--acid-dim)',
                  border: '1px solid var(--acid)',
                  borderRadius: '2px',
                  color: 'var(--acid-text)',
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-condensed font-700 text-sm tracking-widest uppercase transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: 'var(--acid)',
                color: '#000',
                borderRadius: '2px',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {/* Switch */}
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-condensed tracking-wider" style={{ color: 'var(--ink-3)' }}>
              {isLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            onClick={switchMode}
            className="mt-3 w-full py-2.5 font-condensed font-600 text-sm tracking-widest uppercase transition-all duration-150"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-2)',
              borderRadius: '2px',
              color: 'var(--ink-2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--acid)';
              e.currentTarget.style.color = 'var(--acid)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-2)';
              e.currentTarget.style.color = 'var(--ink-2)';
            }}
          >
            {isLogin ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Inline field component to keep Auth.tsx self-contained */
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] font-condensed font-600 tracking-[0.15em] uppercase"
        style={{ color: 'var(--ink-2)' }}
      >
        {label}
      </label>
      <input
        className="gp-input"
        {...props}
      />
    </div>
  );
}
