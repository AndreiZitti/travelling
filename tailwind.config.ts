import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        globe: {
          bg: "#0f0f1a",
          unvisited: "#2d2d44",
          visited: "#6366f1",
          glow: "#22d3ee",
        },
        map: {
          bg: "#fafafa",
          unvisited: "#f5f5f5",
          border: "#e5e5e5",
        },
        been: {
          bg: "#000000",
          card: "#1C1C1E",
          accent: "var(--been-accent)",  // Dynamic accent color from CSS variable
          text: "#FFFFFF",
          muted: "#8E8E93",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
