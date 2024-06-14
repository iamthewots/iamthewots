<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { computed, onMounted, ref, watch, type Ref } from "vue";

export interface BaseRadioProps {
  modelValue: string;
}

export interface BaseRadioEmits {
  (e: "update:modelValue", value: string): void;
  (e: "base-radio:selected", value: string): void;
  (e: "base-radio:unselected", value: string): void;
}

export interface BaseRadio {
  inputElement: Ref<HTMLInputElement | null>;
}

defineOptions({
  name: "BaseRadio",
  inheritAttrs: false,
});

const props = defineProps<BaseRadioProps>();
const emits = defineEmits<BaseRadioEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();
const currentRadioValue = computed(() => props.modelValue);
let wasLastSelected: boolean;

function handleInputEvent(e: Event) {
  const { value } = e.target as HTMLInputElement;
  emits("update:modelValue", value);
  emits("base-radio:selected", value);
  wasLastSelected = true;
}

watch(currentRadioValue, () => {
  const value = inputElement.value?.value || "";
  if (wasLastSelected && currentRadioValue.value != inputElement.value?.value) {
    wasLastSelected = false;
    emits("base-radio:unselected", value);
  }
});

onMounted(() => {
  wasLastSelected = props.modelValue === inputElement.value?.value;
});

defineExpose<BaseRadio>({ inputElement });
</script>

<template>
  <label class="base-radio" v-bind="styleAttrs">
    <div class="base-radio__slider">
      <div class="base-radio__handle"></div>
    </div>
    <div class="base-radio__label">
      <slot></slot>
    </div>
    <input
      type="radio"
      :checked="inputElement?.value === modelValue"
      @input="handleInputEvent"
      v-bind="nonStyleAttrs"
      ref="inputElement"
    />
  </label>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-radio {
  position: relative;
  align-items: center;
  grid-template-columns: auto minmax(0, 1fr);
  display: inline-grid;
  gap: wtk.get("spacing", "sm");
  width: fit-content;
  cursor: pointer;

  &__slider {
    @include theme.set-color-scheme("input");

    aspect-ratio: 1;
    border: wtk.get("border");
    border-radius: 100rem;
    height: calc(wtk.get("height", "input") / 2);
    background-color: var(--color-input-inactive);
  }

  &__handle {
    scale: 0;
    transition: scale wtk.get("duration", "sm") ease-out;
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

.base-radio:has(input:focus-visible) {
  .base-radio__slider {
    outline: wtk.get("outline");
  }
}

.base-radio:has(input:checked) {
  .base-radio__slider {
    background-color: var(--color-input-active);
  }

  .base-radio__handle {
    scale: 0.75;
  }
}
</style>
