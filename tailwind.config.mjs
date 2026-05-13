/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(59, 130, 246)',
          hover: 'rgb(37, 99, 235)',
        },
        surface: 'rgb(30, 41, 59)',
        bg: 'rgb(15, 23, 42)',
        border: 'rgb(51, 65, 85)',
        text: {
          DEFAULT: 'rgb(248, 250, 252)',
          muted: 'rgb(148, 163, 184)',
        },
        error: 'rgb(239, 68, 68)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease',
        fadeOut: 'fadeOut 0.2s ease',
        slideUp: 'slideUp 0.3s ease',
        slideDown: 'slideDown 0.3s ease',
        slideInRight: 'slideInRight 0.3s ease',
        scaleIn: 'scaleIn 0.2s ease',
        shimmer: 'shimmer 1.5s infinite',
        shake: 'shake 0.5s ease-in-out',
        pulse: 'pulse 2s infinite',
        bounce: 'bounce 0.5s ease',
      },
    },
  },
  plugins: [],
}
