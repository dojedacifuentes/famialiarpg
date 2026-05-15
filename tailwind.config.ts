import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: "#00e5ff",
          cyan: "#22d3ee",
          violet: "#a78bfa",
          red: "#ff2e63",
          amber: "#fbbf24",
        },
        ink: {
          900: "#05060a",
          800: "#0a0d14",
          700: "#10141e",
          600: "#161b27",
          500: "#1f2533",
          400: "#2c3344",
        },
        parchment: "#e8e2cf",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        serif: ['"IM Fell English"', "Georgia", "serif"],
        display: ['"Cinzel"', "serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,229,255,.25), inset 0 0 24px rgba(0,229,255,.08)",
        glowRed: "0 0 24px rgba(255,46,99,.35), inset 0 0 24px rgba(255,46,99,.1)",
      },
      keyframes: {
        scan: { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "0 100%" } },
        flicker: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.85" } },
        glitch: { "0%,100%": { transform: "translate(0)" }, "20%": { transform: "translate(-1px,1px)" }, "40%": { transform: "translate(1px,-1px)" }, "60%": { transform: "translate(-1px,-1px)" } },
      },
      animation: {
        scan: "scan 6s linear infinite",
        flicker: "flicker 2.2s infinite",
        glitch: "glitch .35s steps(2) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
