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
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        navy: {
          dark: "#0D1B3E",
        },
        brand: {
          bg: '#0D1B3E',
          accent: '#C8963E',
          'accent-hover': '#B08332',
          muted: '#4A5568',
        },
        status: {
          present: "#C8963E",
          partial: "#F59E0B", // Amber
          missing: "#EF4444", // Red
        },
        tier5: {
          bg: "#F0EFE9", // Light paper
          badge: "#FFFFFF", // Cards
          text: "#0D1B3E",
          border: "#C8963E"
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
