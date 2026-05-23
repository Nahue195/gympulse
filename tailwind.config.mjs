/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New design system tokens
        base:      'var(--base)',
        surface:   'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border:    'var(--border)',
        'border-2': 'var(--border-2)',
        acid:      'var(--acid)',
        'acid-text': 'var(--acid-text)',
        fire:      'var(--fire)',
        ink:       'var(--ink)',
        'ink-2':   'var(--ink-2)',
        'ink-3':   'var(--ink-3)',

        // Legacy aliases kept for existing page classes
        primary: {
          DEFAULT: 'var(--acid)',
          hover:   'var(--acid-text)',
        },
        error: 'var(--fire)',
        text: {
          DEFAULT: 'var(--ink)',
          muted:   'var(--ink-2)',
        },
      },
      fontFamily: {
        display:    ['Bebas Neue', 'sans-serif'],
        condensed:  ['Barlow Condensed', 'sans-serif'],
        sans:       ['Barlow', 'sans-serif'],
      },
      borderRadius: {
        sm:  '2px',
        md:  '2px',
        lg:  '4px',
        xl:  '6px',
        '2xl': '8px',
        full: '9999px',
      },
      animation: {
        fadeIn:       'fadeIn 0.2s ease both',
        fadeOut:      'fadeOut 0.2s ease both',
        slideUp:      'slideUp 0.28s ease both',
        slideDown:    'slideDown 0.22s ease both',
        slideInRight: 'slideInRight 0.25s ease both',
        scaleIn:      'scaleIn 0.2s ease both',
        shimmer:      'shimmer 1.4s linear infinite',
        shake:        'shake 0.45s ease-in-out',
        pulse:        'pulse 2s ease infinite',
        bounce:       'bounce 0.5s ease',
        acidPulse:    'acidPulse 2s ease infinite',
        heartBeat:    'heartBeat 0.4s ease',
        spinSlow:     'spinSlow 8s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeOut:  { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown:{ '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:  { '0%': { opacity: '0', transform: 'scale(0.97)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulse:     { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        bounce:    { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(1.1)' },
        },
        acidPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(204,255,0,0.18)' },
          '50%':       { boxShadow: '0 0 12px 3px rgba(204,255,0,0.18)' },
        },
        spinSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
}
