/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // --- Forge palette: warm near-black, hot-metal ember accent ---
        forge: {
          bg: '#0D0D0F', // base — a slightly warm near-black
          panel: '#17171B', // surfaces / panels
          input: '#121216', // inset fields
          hover: '#202027', // hover state on surfaces
          border: '#2A2A2F', // 1px hairline borders
          text: '#EDEDEF', // primary text
          muted: '#8B8B93', // secondary text
          accent: '#E8590C', // ember / forge accent
          accent2: '#FF6F1F', // brighter ember for hover
          glow: '#E8590C', // logo glow
        },
        // Semantic status colors
        ok: '#3DD68C', // 2xx
        warn: '#F5C451', // 3xx
        err: '#F2545B', // 4xx / 5xx
        // Method badge hues
        method: {
          get: '#2BB6A0', // blue-green
          post: '#E8590C', // ember
          put: '#4C8DFF', // blue
          patch: '#B084F5', // violet
          delete: '#F2545B', // red
          other: '#8B8B93', // muted
        },
      },
      fontFamily: {
        // UI chrome
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        // Data: URLs, JSON, headers, code
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        // Status code "hot stamp" — quick scale-in with a flash of color
        hotStamp: {
          '0%': { transform: 'scale(0.9)', filter: 'brightness(2.2)', opacity: '0.4' },
          '60%': { transform: 'scale(1.03)', filter: 'brightness(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)', opacity: '1' },
        },
        // Send-in-flight "hammering" pulse
        hammer: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '45%': { transform: 'translateY(1px) rotate(-12deg)' },
          '55%': { transform: 'translateY(1px) rotate(-12deg)' },
        },
        emberGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        hotStamp: 'hotStamp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        hammer: 'hammer 0.5s ease-in-out infinite',
        emberGlow: 'emberGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
