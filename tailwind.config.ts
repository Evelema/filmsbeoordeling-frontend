import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: "#0d0d0d",
          card: "#1a1a1a",
          border: "#2a2a2a",
          gold: "#f5c518",
          text: "#e5e5e5",
          muted: "#888",
        },
      },
    },
  },
  plugins: [],
};

export default config;
