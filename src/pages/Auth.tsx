import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!displayName || !username) {
          throw new Error('Por favor completa todos los campos');
        }
        await signUp(email, password, displayName, username);
        setSuccess('¡Registro exitoso! Iniciando sesión...');
        // Esperar un momento para que el trigger cree el perfil
        setTimeout(() => {
          signIn(email, password).catch(() => {
            setSuccess('');
            setError('Registro exitoso. Por favor inicia sesión manualmente.');
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">GymPulse</h1>
          <p className="text-slate-400 text-lg">
            {isLogin
              ? 'Inicia sesión para continuar'
              : 'Crea tu cuenta y comienza'}
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Nombre completo"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
                <Input
                  label="Nombre de usuario"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="juanperez"
                  required
                />
              </>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </Button>
          </form>
        </Card>

        <div className="text-center space-x-2">
          <span className="text-slate-400">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
