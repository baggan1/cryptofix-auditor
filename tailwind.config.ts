import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ibm-sans)', 'sans-serif'],
        serif: ['var(--font-ibm-sans)', 'serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      colors: {
        navy: {
          dark: "#1F3178",
        },
        brand: {
          bg: '#1F3178',
          accent: '#10B981',
          'accent-hover': '#059669',
          muted: '#94A3B8',
        },
        status: {
          present: "#10B981", // Updated from #1D9E75
          partial: "#F59E0B", // Amber
          missing: "#EF4444", // Red
        },
        tier5: {
          bg: "#f5f3ff", // light purple
          badge: "#faf5ff",
          text: "#7e22ce",
          border: "#e9d5ff"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
