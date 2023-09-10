import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { readFileSync } from "fs";
import sirv from "sirv";
import compression from "@fastify/compress";
import vuePlugin from "@vitejs/plugin-vue";
import { RenderResult, render as serverRender } from "../../shared/entry/server";
import { ViteDevServer, createServer } from "vite";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fastifyStatic from "@fastify/static";

const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction ? readFileSync("./dist/client/index.html", "utf-8") : "";
const ssrManifest = isProduction ? readFileSync("./dist/client/ssr-manifest.json", "utf-8") : undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.setGlobalPrefix("/api");
  const instance: FastifyInstance = app.getHttpAdapter().getInstance();

  let vite: ViteDevServer;
  if (!isProduction) {
    vite = await createServer({
      cacheDir: "./node_modules/.vite-dev",
      server: { middlewareMode: true },
      appType: "custom",
      base,
      plugins: [vuePlugin()],
    });
    app.use(vite.middlewares);
  } else {
    instance.register(compression);
    app.use(base, sirv("./dist/client", { extensions: [] }));
  }

  instance.register(fastifyStatic, {
    root: "/public",
    prefix: "/public/",
  });

  // Serve HTML
  app.use(async (req: FastifyRequest["raw"], res: FastifyReply["raw"], next: HookHandlerDoneFunction) => {
    const { method, url } = req;
    if (method === "GET" && !url.includes("graphql")) {
      try {
        const url = req.url.replace(base, "");

        let template;
        let render;
        if (!isProduction) {
          // Always read fresh template in development
          template = readFileSync("./index.html", "utf-8");
          template = await vite.transformIndexHtml(url, template);
          render = (await vite.ssrLoadModule("packages/shared/entry/server")).render;
        } else {
          template = templateHtml;
          render = serverRender;
        }

        const { head, html, css } = <RenderResult>await render(url, ssrManifest);

        const renderedHtml = template
          .replace(`<!--app-head-->`, head ?? "")
          .replace(`<!--app-html-->`, html ?? "")
          .replace(`<!--css-outlet-->`, css);

        res.end(renderedHtml);
      } catch (e) {
        vite?.ssrFixStacktrace(e);
        console.log((<Error>e).stack);
        res.statusCode = 500;
        res.end((<Error>e).stack);
      }
    }

    next();
  });
  return app;
}

const app = await bootstrap();

if (import.meta.env.PROD) {
  app.listen(3000);
}

export const viteNodeApp = app;
