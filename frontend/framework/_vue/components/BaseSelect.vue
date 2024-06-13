<script setup lang="ts">
import { onMounted, ref } from "vue";

export interface BaseSelectProps {
  multiSelect?: number;
}

export interface BaseSelectEmits {
  (e: "update:modelValue", values: Set<string>): void;
  (e: "base-select:change", values: Set<string>): void;
  (e: "base-select:select", value: string): void;
  (e: "base-select:unselect", value: string): void;
}

export interface BaseSelect {}

defineOptions({
  name: "BaseSelect",
  inheritAttrs: false,
});

const props = defineProps<BaseSelectProps>();
const emits = defineEmits<BaseSelectEmits>();
const selectedOptionsElement = ref<HTMLElement | null>(null);
const unselectedOptionsElement = ref<HTMLElement | null>(null);
const selectedValues = new Set<string>();

function splitOptions() {
  if (
    selectedOptionsElement.value === null ||
    unselectedOptionsElement.value === null
  ) {
    return;
  }
}

function handleClickEvent() {}

onMounted(() => {});
</script>

<template>
  <div class="base-select" @click="handleClickEvent" v-bind="$attrs">
    <div
      class="base-select__group base-select__selected-options"
      ref="selectedOptionsElement"
    ></div>
    <div
      class="base-select__group base-select__unselected-options"
      ref="unselectedOptionsElement"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-select {
  @include theme.set-color-scheme("input");

  position: relative;
  display: grid;
  border: wtk.get("border");

  &__group {
    justify-content: center;
    flex-wrap: wrap;
    display: flex;
    padding: wtk.get("spacing", "sm");
    gap: wtk.get("spacing", "sm");

    &:empty {
      display: none;
    }
  }

  &__unselected-options {
    // max-3-rows, then scroll?
  }

  option {
    flex-grow: 1;
    border-radius: wtk.get("border", "radius");
    padding: wtk.get("spacing", 0.15rem) wtk.get("spacing", 0.3rem);
    min-width: min(20%, 200px);
    background-color: var(--color-input-handle);
    text-align: center;
    cursor: pointer;
  }
}
</style>
