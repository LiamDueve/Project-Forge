import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        ink: "#0A0A0A",
        paper: "#FAFAFA",
        line: "#E6E6E4",
        graphite: "#6B6B68",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 8px 24px rgba(10,10,10,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
