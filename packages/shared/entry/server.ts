import { renderToString } from "vue/server-renderer";
import { createApp } from "./";

export async function render() {
  const { app } = createApp();
  const ctx = {};
  const html = await renderToString(app, ctx);
  return { html };
}
