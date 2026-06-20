/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        "2xl": "calc(var(--radius) + 6px)",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,.08), 0 32px 80px rgba(2,6,23,.46)",
        soft: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.12)",
        "soft-lg": "0 4px 8px -4px rgba(16,24,40,.06), 0 24px 48px -12px rgba(16,24,40,.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-18px,0) scale(1.04)" },
        },
        enter: {
          from: { opacity: "0", transform: "translateY(14px) scale(.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          from: { transform: "translateX(-140%) skewX(-18deg)" },
          to: { transform: "translateX(340%) skewX(-18deg)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        enter: "enter .55s cubic-bezier(.2,.8,.2,1) both",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        "fade-in": "fade-in .4s cubic-bezier(.2,.8,.2,1) both",
        "scale-in": "scale-in .18s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
}
