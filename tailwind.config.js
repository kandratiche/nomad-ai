/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0F172A",
          secondary: "#111827",
          card: "#1E293B",
          surface: "#F8FAFC",
          surfaceLight: "#F1F5F9",
        },
        accent: {
          primary: "#2DD4BF",
          secondary: "#FACC15",
          tertiary: "#A78BFA",
        },
        status: {
          safe: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        display: ["Montserrat_400Regular"],
        "display-medium": ["Montserrat_500Medium"],
        "display-semibold": ["Montserrat_600SemiBold"],
        "display-bold": ["Montserrat_700Bold"],
      },
    },
  },
  plugins: [],
};
