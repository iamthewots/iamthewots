<script setup lang="ts">
import {
  useInputTools,
  type InputTools,
  type InputToolsEmits,
  type InputToolsProps,
} from "@_vue/composables/use-input-tools";
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface BaseTextAreaProps {
  storageId?: InputToolsProps["storageId"];
  storageType?: InputToolsProps["storageType"];
  enableAutosave?: InputToolsProps["enableAutosave"];
  autosaveInterval?: InputToolsProps["autosaveInterval"];
}

export interface BaseTextAreaEmits extends InputToolsEmits<"base-text-area:"> {
  (e: "update:modelValue", value: string): void;
}

export interface BaseTextAreaSlot {
  clearValue: InputTools["clearValue"];
  saveValue: InputTools["saveValue"];
  restoreValue: InputTools["restoreValue"];
  enableAutosave: InputTools["enableAutosave"];
  disableAutosave: InputTools["disableAutosave"];
}

export interface BaseTextArea {
  textAreaElement: Ref<HTMLTextAreaElement | null>;
  browserStorage: InputTools["browserStorage"];
  clearValue: InputTools["clearValue"];
  saveValue: InputTools["saveValue"];
  restoreValue: InputTools["restoreValue"];
  enableAutosave: InputTools["enableAutosave"];
  disableAutosave: InputTools["disableAutosave"];
}

defineOptions({
  name: "BaseTextArea",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseTextAreaProps>(), {
  autosaveInterval: 2000,
  autosaveKey: "_autosave",
});
const emits = defineEmits<BaseTextAreaEmits>();
const textAreaElement = ref<HTMLTextAreaElement | null>(null);
const {
  browserStorage,
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
} = useInputTools({
  inputElement: textAreaElement,
  emits,
  emitsPrefix: "base-text-area:",
  storageId: props.storageId,
  storageType: props.storageType,
});
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

onMounted(() => {});

onBeforeUnmount(() => disableAutosave());

const slotProps: BaseTextAreaSlot = {
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
};
defineExpose<BaseTextArea>({
  textAreaElement,
  browserStorage,
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
});
</script>

<template>
  <div class="base-text-area" v-bind="styleAttrs">
    <textarea
      cols="30"
      rows="10"
      v-bind="nonStyleAttrs"
      ref="textAreaElement"
    ></textarea>
  </div>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-text-area {
  @include theme.set-color-scheme("input");

  border: wtk.get("border");
  width: 100%;

  &:has(textarea:focus-visible) {
    outline: wtk.get("outline");
  }

  textarea {
    outline: none;
    border: none;
    padding: wtk.get("spacing", "xs");
    width: 100%;
    background-color: transparent;
    font-family: wtk.get("font-family", "input");
    font-size: wtk.get("font-size", "md");
    color: inherit;
  }
}
</style>
