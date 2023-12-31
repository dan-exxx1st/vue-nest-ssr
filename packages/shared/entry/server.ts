import { SSRContext, renderToString } from "vue/server-renderer";
import { createApp } from "./";

export type RenderResult = {
  html: string;
  head: string;
  css: string;
};

export async function render(url: string): Promise<RenderResult> {
  const { app, router, store, apolloProvider, cssHtml } = createApp(true);

  const apollo = await import("@vue/apollo-ssr/dist/cjs/index.js");
  // set the router to the desired URL before rendering
  await router.push(url);
  await router.isReady();

  const ctx = <SSRContext>{};

  ctx.rendered = () => {
    // After the app is rendered, our store is now
    // filled with the state from our components.
    // When we attach the state to the context, and the `template` option
    // is used for the renderer, the state will automatically be
    // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
    ctx.state = store.state;

    // ALso inject the apollo cache state

    ctx.apolloState = apollo.getStates(apolloProvider.clients);
  };

  const html = await renderToString(app, ctx);
  const head = "";

  return { html, head, css: cssHtml };
}
