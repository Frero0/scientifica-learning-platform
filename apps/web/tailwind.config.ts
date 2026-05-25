import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141614",
        paper: "#F6F7F2",
        mist: "#E7EAE2",
        copper: "#B66A2C",
        forest: "#16433C",
        aqua: "#0F766E",
        cream: "#FFFDF6",
        line: "rgba(20, 22, 20, 0.1)"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 22, 20, 0.08)",
        lift: "0 22px 60px rgba(20, 22, 20, 0.12)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.7)"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};

export default config;
