import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { readFileSync } from "fs";
import sirv from "sirv";
import compression from "compression";
import vuePlugin from "@vitejs/plugin-vue";
import { render as serverRender } from "../../shared/entry/server";
import { createServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction ? readFileSync("./dist/client/index.html", "utf-8") : "";
const ssrManifest = isProduction ? readFileSync("./dist/client/ssr-manifest.json", "utf-8") : undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api");

  let vite;
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

  // Serve HTML
  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, "");

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

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite?.ssrFixStacktrace(e);
      console.log((<Error>e).stack);
      res.status(500).end((<Error>e).stack);
    }
  });
  return app;
}

const app = await bootstrap();

if (import.meta.env.PROD) {
  app.listen(3000);
}

export const viteNodeApp = app;
