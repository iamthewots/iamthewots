<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { ref, type Ref } from "vue";

export interface BaseSwitchProps {
  modelValue?: boolean;
}

export interface BaseSwitchEmits {
  (e: "update:modelValue", checked: boolean): void;
  (e: "base-switch:switch-on"): void;
  (e: "base-switch:switch-off"): void;
}

defineOptions({
  name: "BaseSwitch",
  inheritAttrs: false,
});

const props = defineProps<BaseSwitchProps>();
const emits = defineEmits<BaseSwitchEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleInputEvent(e: Event) {
  const { checked } = e.target as HTMLInputElement;
  emits("update:modelValue", checked);

  if (checked) {
    emits("base-switch:switch-on");
  } else {
    emits("base-switch:switch-off");
  }
}

export interface BaseSwitch {
  inputElement: (typeof inputElement)["value"];
}
defineExpose({ inputElement });
</script>

<template>
  <label class="base-switch" v-bind="styleAttrs">
    <div class="base-switch__slider">
      <div class="base-switch__handle"></div>
    </div>
    <div class="base-switch__label">
      <slot></slot>
    </div>
    <input
      type="checkbox"
      :checked="modelValue"
      @input="handleInputEvent"
      v-bind="nonStyleAttrs"
      ref="inputElement"
    />
  </label>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-switch {
  position: relative;
  align-items: center;
  grid-template-columns: auto minmax(0, 1fr);
  display: inline-grid;
  gap: wtk.get("spacing", "sm");
  width: fit-content;
  cursor: pointer;

  &__slider {
    @include theme.set-color-scheme("input");

    position: relative;
    display: flex;
    overflow: clip;
    aspect-ratio: 2;
    border: wtk.get("border");
    border-radius: 100rem;
    height: calc(wtk.get("height", "input") / 2);
    background-color: var(--color-input-inactive);
  }

  &__handle {
    position: absolute;
    left: 0%;
    transition: all 200ms ease-out;
    aspect-ratio: 1;
    border-radius: inherit;
    height: 100%;
    background-color: var(--color-input-handle);
  }

  input {
    position: absolute;
    z-index: -1;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.base-switch:has(input:focus-visible) {
  .base-switch__slider {
    outline: wtk.get("outline");
  }
}

.base-switch:has(input:checked) {
  .base-switch__slider {
    background-color: var(--color-input-active);
  }

  .base-switch__handle {
    left: 100%;
    translate: -100% 0%;
  }
}
</style>
