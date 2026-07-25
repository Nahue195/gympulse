import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** UI alternativa opcional. Si no se pasa, se usa la pantalla por defecto. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Captura errores de render en el árbol de componentes para evitar que un fallo
 * en una página tumbe toda la app a pantalla en blanco. Ver App.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary capturó un error:', error, info.componentStack);
    }
    // TODO: enviar a un servicio de monitoreo (Sentry, etc.) en producción.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
        <p className="text-slate-400 max-w-sm mb-6">
          Ocurrió un error inesperado en esta sección. Podés intentar recargarla.
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
          <button
            onClick={() => window.location.assign('/')}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            Ir al inicio
          </button>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-6 max-w-lg overflow-auto text-left text-xs text-red-300/80 bg-black/30 rounded-lg p-3">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
