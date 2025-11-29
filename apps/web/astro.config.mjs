// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [svelte(), react()],
  output: "server",
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
           @use "@/styles/global.scss" as *;
           @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
  },
});
