import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@_sass": fileURLToPath(new URL("./_sass", import.meta.url)),
      "@_vue": fileURLToPath(new URL("./_vue", import.meta.url)),
    },
  },
});
