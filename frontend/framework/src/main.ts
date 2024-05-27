import "./assets/style.scss";
import wtkVuePlugin from "@_vue/index";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(wtkVuePlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
