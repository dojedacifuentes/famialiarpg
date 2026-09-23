import type { Config } from "tailwindcss";

// Paleta "noir notarial": noche de Santiago, luz de sodio (oro), neón frío de
// las oficinas (cian), tinta violeta de los artículos y papel de expediente.
// Los valores viven como variables CSS en globals.css; aquí sólo se nombran.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: {
          950: "#07080d",
          900: "#0b0d14",
          850: "#10131c",
          800: "#141824",
          700: "#1b2030",
          600: "#252b3d",
          500: "#343c55",
        },
        papel: {
          DEFAULT: "#ece6d6",
          2: "#cfc8b6",
          3: "#a9a291",
          doc: "#f1e8d2",
        },
        oro: { DEFAULT: "#e0b25c", claro: "#f0cd84", oscuro: "#9c7430" },
        cian: { DEFAULT: "#6fd6e8", oscuro: "#2f8a9a" },
        violeta: { DEFAULT: "#bda6ff", oscuro: "#6c56b8" },
        rojo: { DEFAULT: "#ff7a8a", oscuro: "#a33347" },
        verde: { DEFAULT: "#8fe0a6", oscuro: "#2f7a4a" },
      },
      // Sólo dos familias. `serif` y `mono` apuntan a la de lectura para que
      // ninguna utilidad heredada pueda introducir una tercera tipografía.
      fontFamily: {
        display: ["var(--fuente-display)", "Georgia", "serif"],
        sans: ["var(--fuente-lectura)", "system-ui", "sans-serif"],
        serif: ["var(--fuente-lectura)", "system-ui", "sans-serif"],
        mono: ["var(--fuente-lectura)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Escala central: ver variables --t-* en globals.css.
        micro: ["var(--t-micro)", { lineHeight: "1.35" }],
        meta: ["var(--t-meta)", { lineHeight: "1.45" }],
        base: ["var(--t-base)", { lineHeight: "1.5" }],
        lectura: ["var(--t-lectura)", { lineHeight: "1.55" }],
        titulo: ["var(--t-titulo)", { lineHeight: "1.2" }],
        display: ["var(--t-display)", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config;
