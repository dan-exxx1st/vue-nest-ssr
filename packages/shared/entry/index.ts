import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { createRouter } from "../../client/src/router";
import App from "../../client/src/App.vue";

export function createApp() {
    const pinia = createPinia();
    const app = createSSRApp(App);
    const router = createRouter();

    app.use(pinia);
    app.use(router);

    return { app };
}
