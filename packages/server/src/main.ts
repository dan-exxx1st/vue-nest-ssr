import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { readFileSync } from "fs";
import sirv from "sirv";
import compression from "compression";
import vuePlugin from "@vitejs/plugin-vue";
import { render as serverRender } from "../../shared/entry/server";
import { ViteDevServer, createServer } from "vite";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fastifyStatic from "@fastify/static";

const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction ? readFileSync("./dist/client/index.html", "utf-8") : "";
const ssrManifest = isProduction ? readFileSync("./dist/client/ssr-manifest.json", "utf-8") : undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.setGlobalPrefix("/api");

  let vite: ViteDevServer;
  if (!isProduction) {
    vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      base,
      plugins: [vuePlugin()],
    });
    app.use(vite.middlewares);
  } else {
    app.use(compression());
    app.use(base, sirv("./dist/client", { extensions: [] }));
  }

  (app as unknown as NestFastifyApplication).register(fastifyStatic, {
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

        const rendered = await render(url, ssrManifest);

        const html = template
          .replace(`<!--app-head-->`, rendered.head ?? "")
          .replace(`<!--app-html-->`, rendered.html ?? "");

        res.end(html);
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
