import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { createRouter } from "../../client/src/router";
import App from "../../client/src/App.vue";
import { createApolloClient } from "../apollo";
import * as ApolloOption from "@vue/apollo-option/dist/vue-apollo-option.umd.js";

export function createApp(ssr = false) {
  const store = createPinia();
  const app = createSSRApp(App);
  const router = createRouter();
  const apolloClient = createApolloClient(ssr);

  const apolloProvider = ApolloOption.createApolloProvider({
    defaultClient: apolloClient,
  });

  app.use(store);
  app.use(router);
  app.use(apolloProvider);

  return { app, router, store, apolloProvider };
}
