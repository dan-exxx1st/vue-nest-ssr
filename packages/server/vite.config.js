import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    build:{
        outDir:"dist/server"
    },
    server: {
        port: 3000
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
        disabled:true,
        exclude: [
            "@nestjs/microservices",
            "@nestjs/websockets",
            "cache-manager",
            "class-transformer",
            "class-validator",
            "fastify-swagger",
        ],
    },
    esbuild: {
        supported: {
            "top-level-await": true,
        },
    },
});
