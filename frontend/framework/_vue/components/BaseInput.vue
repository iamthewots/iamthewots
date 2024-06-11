<script setup lang="ts">
import {
  useInputTools,
  type InputTools,
  type InputToolsEmits,
  type InputToolsProps,
} from "@_vue/composables/use-input-tools";
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface BaseInputProps {
  enableVisibilityToggle?: boolean;
  storageId?: InputToolsProps["storageId"];
  storageType?: InputToolsProps["storageType"];
  enableAutosave?: InputToolsProps["enableAutosave"];
  autosaveInterval?: InputToolsProps["autosaveInterval"];
  autosaveKey?: InputToolsProps["autosaveKey"];
}

export interface BaseInputEmits extends InputToolsEmits<"base-input:"> {
  (e: "update:modelValue", value: string): void;
  (e: "base-input:visibility-change", inputElementValueIsHidden: boolean): void;
}

export interface BaseInputSlot {
  toggleVisibility: () => void;
  clearValue: InputTools["clearValue"];
  saveValue: InputTools["saveValue"];
  restoreValue: InputTools["restoreValue"];
  enableAutosave: InputTools["enableAutosave"];
  disableAutosave: InputTools["disableAutosave"];
}

export interface BaseInput {
  toggleVisibility: () => void;
  browserStorage: InputTools["browserStorage"];
  clearValue: InputTools["clearValue"];
  saveValue: InputTools["saveValue"];
  restoreValue: InputTools["restoreValue"];
  enableAutosave: InputTools["enableAutosave"];
  disableAutosave: InputTools["disableAutosave"];
}

defineOptions({
  name: "BaseInput",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseInputProps>(), {
  autosaveInterval: 2000,
  autosaveKey: "_autosave",
});
const emits = defineEmits<BaseInputEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const inputElementOriginalType = ref("text");
const inputElementValueIsHidden = ref(false);
const {
  browserStorage,
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
} = useInputTools({
  inputElement,
  emits,
  emitsPrefix: "base-input:",
  storageId: props.storageId,
  storageType: props.storageType,
});
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function toggleVisibility() {
  if (props.enableVisibilityToggle === false || inputElement.value === null) {
    return;
  }

  inputElement.value.type = inputElementValueIsHidden.value
    ? inputElementOriginalType.value
    : "password";
  inputElementValueIsHidden.value = !inputElementValueIsHidden.value;
  emits("base-input:visibility-change", inputElementValueIsHidden.value);
}

function handleInputEvent(e: Event) {
  emits("update:modelValue", (e.target as HTMLInputElement).value);
}

onMounted(() => {
  if (inputElement.value === null) {
    return;
  }

  inputElementOriginalType.value = inputElement.value.type;
  inputElementValueIsHidden.value = inputElement.value.type === "password";
});

onBeforeUnmount(() => disableAutosave());

const slotProps = {
  toggleVisibility,
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
};
defineExpose({
  inputElement,
  browserStorage,
  toggleVisibility,
  clearValue,
  saveValue,
  restoreValue,
  enableAutosave,
  disableAutosave,
});
</script>

<template>
  <div class="base-input" v-bind="styleAttrs">
    <div class="base-input__section base-input__prepend-section">
      <slot name="prepend-section" v-bind="slotProps"></slot>
    </div>
    <input
      type="text"
      @input="handleInputEvent"
      v-bind="nonStyleAttrs"
      ref="inputElement"
    />
    <div class="base-input__section base-input__actions-section">
      <slot name="actions-section" v-bind="slotProps"></slot>
    </div>
    <div class="base-input__section base-input__append-section">
      <slot name="append-section" v-bind="slotProps"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-input {
  @include theme.set-color-scheme("input");

  align-items: center;
  display: flex;
  border: wtk.get("border");
  gap: wtk.get("spacing", "xs");
  width: 100%;
  height: wtk.get("height", "input");

  &:has(input:focus-visible) {
    outline: wtk.get("outline");
  }

  &__section:empty {
    display: none;
  }

  input {
    flex-grow: 1;
    outline: none;
    border: none;
    padding-inline: wtk.get("spacing", "xs");
    height: 100%;
    background-color: transparent;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
}
</style>
