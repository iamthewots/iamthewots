import { type App } from "vue";
import BaseHoverBox from "./components/BaseHoverBox.vue";

interface PluginOptions {
  componentsPrefix?: string;
  appendMaterialIconsLink?: boolean;
}

export default {
  install(vueApp: App, pluginOptions: PluginOptions = {}) {
    const componentsPrefix = pluginOptions.componentsPrefix || "Base";

    vueApp.component(`${componentsPrefix}HoverBox`, BaseHoverBox);
  },
};
