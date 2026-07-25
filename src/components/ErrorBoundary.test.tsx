import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Componente que lanza un error de render bajo demanda.
function Boom({ crash }: { crash: boolean }) {
  if (crash) throw new Error('kaboom');
  return <div>contenido ok</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // El boundary loguea en dev; silenciamos el ruido de React en consola.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza los hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <Boom crash={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });

  it('muestra la UI de error cuando un hijo lanza', () => {
    render(
      <ErrorBoundary>
        <Boom crash={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('usa el fallback custom si se provee', () => {
    render(
      <ErrorBoundary fallback={<div>fallback custom</div>}>
        <Boom crash={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback custom')).toBeInTheDocument();
  });

  it('permite reintentar el render tras un error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Boom crash={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    // El usuario arregla la causa y reintenta.
    rerender(
      <ErrorBoundary>
        <Boom crash={false} />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });
});
