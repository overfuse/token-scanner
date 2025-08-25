import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Set base for GitHub Pages deployment under /token-scanner/
  base: "/token-scanner/",
  plugins: [react(), tailwind()],
});
