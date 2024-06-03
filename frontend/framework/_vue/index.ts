import { type App } from "vue";
import BaseDrawer from "./components/BaseDrawer.vue";
import BaseHoverBox from "./components/BaseHoverBox.vue";
import BaseInput from "./components/BaseInput.vue";
import BaseModal from "./components/BaseModal.vue";

interface PluginOptions {
  componentsPrefix?: string;
  appendMaterialIconsLink?: boolean;
}

export default {
  install(vueApp: App, pluginOptions: PluginOptions = {}) {
    const componentsPrefix = pluginOptions.componentsPrefix || "Base";

    vueApp.component(`${componentsPrefix}Drawer`, BaseDrawer);
    vueApp.component(`${componentsPrefix}HoverBox`, BaseHoverBox);
    vueApp.component(`${componentsPrefix}Input`, BaseInput);
    vueApp.component(`${componentsPrefix}Modal`, BaseModal);
  },
};
