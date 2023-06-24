import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  build: {
    outDir: "dist/server",
    rollupOptions: {
      external: ["@vue/apollo-ssr"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          "@vue/apollo-ssr": "@vue/apollo-ssr",
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    vue(),
    ...VitePluginNode({
      adapter: "nest",
      appPath: "packages/server/src/main.ts",
      exportName: "viteNodeApp",
      tsCompiler: "esbuild",
    }),
  ],
  optimizeDeps: {
    exclude: [
      "@nestjs/microservices",
      "@nestjs/websockets",
      "cache-manager",
      "class-transformer",
      "class-validator",
      "fastify-swagger",
      "@apollo/subgraph",
    ],
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
