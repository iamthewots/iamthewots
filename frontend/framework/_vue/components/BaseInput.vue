<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import {
  useInputTools,
  type InputTools,
  type InputToolsEmits,
  type InputToolsProps,
} from "../composables/use-input-tools";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface BaseInputProps extends InputToolsProps {
  modelValue?: string;
  enableVisibilityToggle?: boolean;
}

export interface BaseInputEmits extends InputToolsEmits<`base-input:`> {
  (e: "update:modelValue", payload: string): void;
}

export interface BaseInput extends InputTools {
  inputElement: Ref<HTMLInputElement | null>;
}

defineOptions({
  name: "BaseInput",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseInputProps>(), {
  autosaveInterval: 2000,
});
const emits = defineEmits<BaseInputEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const inputElementOriginalType = ref("text");
const inputElementValueIsHidden = ref(false);
const {
  browserStorage,
  clearInputValue,
  saveInputValue,
  restoreInputValue,
  enableAutosave,
  disableAutosave,
} = useInputTools({
  inputElement,
  emits,
  emitsEventPrefix: "base-input:",
  storageId: props.storageId || "",
  storageType: props.storageType || "local",
});
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleInputEvent(e: Event) {
  emits(
    "update:modelValue",
    inputElement.value !== null ? inputElement.value.value : ""
  );
}

onMounted(() => {
  if (inputElement.value === null) {
    return;
  }

  inputElementOriginalType.value = inputElement.value.type;
  inputElementValueIsHidden.value = inputElement.value.type === "password";

  if (props.enableAutosave) {
    enableAutosave("_autosave", props.autosaveInterval);
  }
});

onBeforeUnmount(() => {
  disableAutosave();
});

const slotProps = {
  clearInputValue,
  saveInputValue,
  restoreInputValue,
  enableAutosave,
  disableAutosave,
};
defineExpose({
  inputElement,
  browserStorage,
  clearInputValue,
  saveInputValue,
  restoreInputValue,
  enableAutosave,
  disableAutosave,
});
</script>

<template>
  <div class="base-input" v-bind="styleAttrs">
    <div class="base-input__section div base-input__prepend-section">
      <slot name="prepend" v-bind="slotProps"></slot>
    </div>
    <div class="base-input__input-wrapper">
      <input
        type="text"
        @input="handleInputEvent"
        v-bind="nonStyleAttrs"
        ref="inputElement"
      />
      <div class="base-input__section base-input__actions-section">
        <slot name="actions" v-bind="slotProps"></slot>
      </div>
    </div>
    <div class="base-input__section div base-input__append-section">
      <slot name="append" v-bind="slotProps"></slot>
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
