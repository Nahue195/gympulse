import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Captura temprana del evento de instalación PWA: puede dispararse antes de que
// React monte el banner, así que lo guardamos en window y avisamos con un evento.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as unknown as { __deferredInstallPrompt?: Event }).__deferredInstallPrompt = e;
  window.dispatchEvent(new Event('pwa-installable'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
