import { type App } from "vue";
import BaseButton from "./components/BaseButton.vue";
import BaseCanvas from "./components/BaseCanvas.vue";
import BaseCard from "./components/BaseCard.vue";
import BaseCheckbox from "./components/BaseCheckbox.vue";
import BaseCounter from "./components/BaseCounter.vue";
import BaseDrawer from "./components/BaseDrawer.vue";
import BaseHoverBox from "./components/BaseHoverBox.vue";
import BaseInput from "./components/BaseInput.vue";
import BaseModal from "./components/BaseModal.vue";
import BaseRadio from "./components/BaseRadio.vue";
import BaseRange from "./components/BaseRange.vue";
import BaseSelect from "./components/BaseSelect.vue";
import BaseSwitch from "./components/BaseSwitch.vue";
import BaseTextArea from "./components/BaseTextArea.vue";
import { trackMouseDirective } from "./directives/track-mouse-directive";

interface PluginOptions {
  componentsPrefix?: string;
  appendMaterialIconsLink?: boolean;
}

export default {
  install(vueApp: App, pluginOptions: PluginOptions = {}) {
    const componentsPrefix = pluginOptions.componentsPrefix || "Base";

    vueApp.component(`${componentsPrefix}Button`, BaseButton);
    vueApp.component(`${componentsPrefix}Canvas`, BaseCanvas);
    vueApp.component(`${componentsPrefix}Card`, BaseCard);
    vueApp.component(`${componentsPrefix}Checkbox`, BaseCheckbox);
    vueApp.component(`${componentsPrefix}Counter`, BaseCounter);
    vueApp.component(`${componentsPrefix}Drawer`, BaseDrawer);
    vueApp.component(`${componentsPrefix}HoverBox`, BaseHoverBox);
    vueApp.component(`${componentsPrefix}Input`, BaseInput);
    vueApp.component(`${componentsPrefix}Modal`, BaseModal);
    vueApp.component(`${componentsPrefix}Radio`, BaseRadio);
    vueApp.component(`${componentsPrefix}Range`, BaseRange);
    vueApp.component(`${componentsPrefix}Select`, BaseSelect);
    vueApp.component(`${componentsPrefix}Switch`, BaseSwitch);
    vueApp.component(`${componentsPrefix}TextArea`, BaseTextArea);
    vueApp.directive("track-mouse", trackMouseDirective);
  },
};
