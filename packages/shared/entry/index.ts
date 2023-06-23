import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { createApolloProvider } from "@vue/apollo-option";
import { createRouter } from "../../client/src/router";
import App from "../../client/src/App.vue";
import { createApolloClient } from "../apollo";

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
