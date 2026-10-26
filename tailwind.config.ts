import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-dark": "#1E3A8A",
        "light-blue": "#DBEAFE",
        "very-light-blue": "#EFF6FF",
        success: "#16A34A",
        warning: "#EAB308",
        error: "#DC2626",
        "text-dark": "#1F2937",
        "text-secondary": "#6B7280",
      },
    },
  },
  plugins: [],
};
export default config;
