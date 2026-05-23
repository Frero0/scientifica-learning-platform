import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141614",
        paper: "#F6F7F2",
        mist: "#E7EAE2",
        copper: "#B66A2C"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 22, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
