import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-11-01",
  css: ["~/assets/css/main.css"],
  vite: {
    // Tailwind's Vite plugin types don't align with Nuxt's plugin types
    plugins: [tailwindcss() as any],
  },
});
