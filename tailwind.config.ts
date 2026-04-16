import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: "#0A1628",
        },
        status: {
          present: "#1D9E75", // Green
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
