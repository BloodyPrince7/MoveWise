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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eef8f5",
          100: "#d6f0e6",
          200: "#aee2ce",
          300: "#7ccdb1",
          400: "#4cb392",
          500: "#2d9878",
          600: "#1f7a60",
          700: "#1c614e",
          800: "#1a4e40",
          900: "#174136",
          950: "#0c2620",
        },
      },
    },
  },
  plugins: [],
};
export default config;
