// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scroll: {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        }
        
      },
      animation: {
        
        scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        
      },
    },
  },
  plugins: [],
};

export default config;





