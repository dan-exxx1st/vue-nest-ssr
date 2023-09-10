import { createSSRApp, createApp as createVueApp } from "vue";
import { createPinia } from "pinia";
import { createRouter } from "../../client/src/router";
import App from "../../client/src/App.vue";
import { createApolloClient } from "../apollo";
import * as ApolloOption from "@vue/apollo-option/dist/vue-apollo-option.umd.js";
import { setup } from "@css-render/vue3-ssr";
import naive from "naive-ui";

export function createApp(ssr = false) {
  const store = createPinia();
  const app = ssr ? createSSRApp(App) : createVueApp(App);
  const router = createRouter();
  const apolloClient = createApolloClient(ssr);
  let cssHtml: string;

  if (ssr) {
    const { collect } = setup(app);
    cssHtml = collect();
  }

  const apolloProvider = ApolloOption.createApolloProvider({
    defaultClient: apolloClient,
  });

  app.use(store);
  app.use(router);
  app.use(apolloProvider);
  app.use(naive);

  return { app, router, store, apolloProvider, cssHtml };
}
