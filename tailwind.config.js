/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // --- Forge palette: layered near-black with a hot-metal ember accent ---
        forge: {
          bg: '#0A0A0C', // base — deepest layer
          panel: '#131316', // panel surfaces
          elevated: '#1B1B1F', // dropdowns / modals (raised)
          input: '#0E0E11', // inset input surfaces (darker than panels)
          hover: '#202027', // hover state on surfaces
          border: '#232327', // 1px hairline borders
          text: '#EDEDEF', // primary text
          muted: '#8B8B93', // secondary text
          accent: '#E8590C', // ember / forge accent
          accent2: '#FF6F1F', // brighter ember for hover
          glow: '#E8590C', // logo glow
        },
        ok: '#3DD68C', // 2xx
        warn: '#F5C451', // 3xx
        err: '#F2545B', // 4xx / 5xx
        method: {
          get: '#3DD68C', // green
          post: '#E8590C', // ember
          put: '#F5C451', // amber
          patch: '#B084F5', // violet
          delete: '#F2545B', // red
          other: '#8B8B93', // muted
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        // Elevated surfaces get depth + a faint ember bloom instead of flat black
        ember: '0 12px 40px -10px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03), 0 10px 44px -16px rgba(232,89,12,0.20)',
        'ember-sm': '0 6px 20px -6px rgba(0,0,0,0.6), 0 0 22px -8px rgba(232,89,12,0.16)',
        'focus-ember': '0 0 0 1px rgba(232,89,12,0.55), 0 0 18px -3px rgba(232,89,12,0.38)',
      },
      backgroundImage: {
        // ~3% top-to-bottom lightening so panels read as surfaces, not flat fills
        'panel-sheen': 'linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0) 42%)',
        // soft ember light bleeding down from the logo area of the top bar
        'topbar-glow': 'radial-gradient(140px 70px at 34px -10px, rgba(232,89,12,0.16), transparent 72%)',
        // 1px gradient border (ember -> transparent) for active/focused controls
        'border-ember': 'linear-gradient(120deg, rgba(232,89,12,0.7), rgba(232,89,12,0.05) 60%, transparent)',
      },
      keyframes: {
        // Snappy status "stamp": scale-in with a brief glow flash — not bouncy
        hotStamp: {
          '0%': { transform: 'scale(0.92)', opacity: '0.5', boxShadow: '0 0 0 0 rgba(232,89,12,0)' },
          '60%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 16px -2px currentColor' },
          '100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        },
        // In-flight "hammer strike" heartbeat — one strike per ~600ms
        heartbeat: {
          '0%, 100%': { transform: 'scale(0.85)', opacity: '0.55' },
          '40%': { transform: 'scale(1.15)', opacity: '1' },
        },
        emberGlow: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        hotStamp: 'hotStamp 0.15s ease-out',
        heartbeat: 'heartbeat 0.6s ease-in-out infinite',
        emberGlow: 'emberGlow 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
