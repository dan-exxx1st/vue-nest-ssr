import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { createRouter } from "../../client/src/router";
import App from "../../client/src/App.vue";
import { createApolloClient } from "../apollo";
import { createApolloProvider } from "@vue/apollo-option";

export function createApp(ssr = false) {
  const store = createPinia();
  const app = createSSRApp(App);
  const router = createRouter();
  const apolloClient = createApolloClient(ssr);
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
  });

  app.use(store);
  app.use(router);
  app.use(apolloProvider);

  return { app, router, store, apolloProvider };
}
