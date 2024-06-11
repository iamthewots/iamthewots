<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { ref, type Ref } from "vue";

export interface BaseCheckboxProps {
  modelValue?: boolean;
}

export interface BaseCheckboxEmits {
  (e: "update:modelValue", checked: boolean): void;
}

export interface BaseCheckbox {
  inputElement: Ref<HTMLInputElement | null>;
}

defineOptions({
  name: "BaseCheckbox",
  inheritAttrs: false,
});

const props = defineProps<BaseCheckboxProps>();
const emits = defineEmits<BaseCheckboxEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleInputEvent(e: Event) {
  emits("update:modelValue", (e.target as HTMLInputElement).checked);
}

defineExpose({ inputElement });
</script>

<template>
  <label class="base-checkbox" v-bind="styleAttrs">
    <div class="base-checkbox__slider">
      <div class="base-checkbox__handle"></div>
    </div>
    <div class="base-checkbox__label">
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

.base-checkbox {
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
    width: 0;
    height: 0;
  }
}

.base-checkbox:has(input:checked) {
  .base-checkbox__slider {
    background-color: var(--color-input-active);
  }

  .base-checkbox__handle {
    left: 100%;
    translate: -100% 0%;
  }
}
</style>
