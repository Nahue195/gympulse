import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

// El evento beforeinstallprompt no está tipado en la lib estándar.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'gp_install_dismissed';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Banner discreto para instalar la PWA.
 * - Android/Chrome: usa el prompt nativo (beforeinstallprompt).
 * - iOS Safari: no hay prompt nativo, muestra el instructivo manual.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    const win = window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent };

    const showFromStash = () => {
      if (win.__deferredInstallPrompt) {
        setDeferred(win.__deferredInstallPrompt);
        setVisible(true);
      }
    };

    // 1) El evento pudo dispararse ANTES de montar (capturado en main.tsx).
    showFromStash();

    // 2) …o dispararse después: escuchamos ambos canales.
    const onInstallable = () => showFromStash();
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onInstalled);

    // iOS no dispara beforeinstallprompt: mostramos el banner de ayuda manual.
    if (isIOS()) setVisible(true);

    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  async function install() {
    if (isIOS()) {
      setShowIOSHelp(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  return (
    <div
      className="fixed left-3 right-3 z-40 flex items-center gap-3 px-3 py-3 lg:left-auto lg:right-6 lg:max-w-sm"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
        background: 'var(--surface-2, #141419)',
        border: '1px solid var(--border, #26262e)',
        borderRadius: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--acid)', borderRadius: '2px' }}
      >
        <Download size={18} color="#000" />
      </div>

      <div className="min-w-0 flex-1">
        {showIOSHelp ? (
          <p className="text-xs leading-snug" style={{ color: 'var(--ink, #eee)' }}>
            Tocá <Share size={12} className="inline -mt-0.5" /> <strong>Compartir</strong> y luego{' '}
            <strong>“Añadir a inicio”</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm font-600 leading-none mb-0.5" style={{ color: 'var(--ink, #eee)' }}>
              Instalar GymPulse
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ink-2, #888)' }}>
              Accedé desde la pantalla de inicio.
            </p>
          </>
        )}
      </div>

      {!showIOSHelp && (
        <button
          onClick={install}
          className="flex-shrink-0 px-3 py-1.5 font-condensed font-700 text-[11px] tracking-widest uppercase"
          style={{ background: 'var(--acid)', color: '#000', borderRadius: '2px' }}
        >
          Instalar
        </button>
      )}

      <button onClick={dismiss} className="flex-shrink-0 p-1" style={{ color: 'var(--ink-3, #666)' }}>
        <X size={16} />
      </button>
    </div>
  );
}
