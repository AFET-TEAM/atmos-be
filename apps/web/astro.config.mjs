import node from "@astrojs/node";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),

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
