/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // One Piece Custom Palette
        ocean: {
          deepest: '#040D1A',
          deep: '#071525',
          mid: '#0A1E35',
          surface: '#0D2847',
          light: '#1A4A7A',
          foam: '#4A90D9',
        },
        doubloon: {
          dark: '#A0780A',
          DEFAULT: '#D4AF37',
          bright: '#F5D05C',
          shine: '#FFE87A',
        },
        ship: {
          red: '#C0392B',
          brown: '#6B3A2A',
          wood: '#8B5E3C',
          light: '#A67C52',
        },
        parchment: {
          dark: '#C4A46B',
          DEFAULT: '#F5E6C8',
          light: '#FDF5E4',
        },
        navy: {
          DEFAULT: '#1A237E',
          light: '#283593',
          coat: '#0D47A1',
        },
        jolly: '#1A1A1A',
      },
      fontFamily: {
        pirate: ['Pirata One', 'Cinzel', 'serif'],
        display: ['Cinzel', 'serif'],
        body: ['Cabin', 'Outfit', 'sans-serif'],
        accent: ['Cinzel', 'serif'],
        cabin: ['Cabin', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'wave': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25%)' },
        },
        'wave2': {
          '0%, 100%': { transform: 'translateX(-25%)' },
          '50%': { transform: 'translateX(0)' },
        },
        'ship-sail': {
          '0%': { transform: 'translateX(-20px) rotate(-1deg)' },
          '50%': { transform: 'translateX(10px) rotate(1deg)' },
          '100%': { transform: 'translateX(-20px) rotate(-1deg)' },
        },
        'float-island': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'chest-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.4), 0 0 60px rgba(212,175,55,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.8), 0 0 100px rgba(212,175,55,0.3)' },
        },
        'chest-open': {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(-120deg)' },
        },
        'coin-pop': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-80px) scale(0.5)', opacity: '0' },
        },
        'compass-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(15deg)' },
          '75%': { transform: 'rotate(-10deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'bounce-wanted': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'cloud-drift': {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        'fog-drift': {
          '0%': { opacity: '0.4', transform: 'translateX(0)' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '0.4', transform: 'translateX(-30px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'rank-shine': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'treasure-burst': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(3) rotate(360deg)', opacity: '0' },
        },
        'flag-wave': {
          '0%, 100%': { transform: 'skewX(0deg)' },
          '25%': { transform: 'skewX(-5deg)' },
          '75%': { transform: 'skewX(5deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'wave': 'wave 12s linear infinite',
        'wave2': 'wave2 8s linear infinite',
        'ship-sail': 'ship-sail 4s ease-in-out infinite',
        'float-island': 'float-island 3s ease-in-out infinite',
        'chest-glow': 'chest-glow 2s ease-in-out infinite',
        'coin-pop': 'coin-pop 0.8s ease-out forwards',
        'compass-spin': 'compass-spin 3s ease-in-out infinite',
        'bounce-wanted': 'bounce-wanted 3s ease-in-out infinite',
        'cloud-drift': 'cloud-drift 30s linear infinite',
        'fog-drift': 'fog-drift 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rank-shine': 'rank-shine 3s linear infinite',
        'treasure-burst': 'treasure-burst 1s ease-out forwards',
        'flag-wave': 'flag-wave 2s ease-in-out infinite',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};