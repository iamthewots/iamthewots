<script setup lang="ts">
import { ref } from "vue";

export interface BaseSelectProps {}

export interface BaseSelectEmits {
  (e: "update:modelValue", value: string | string[]): void;
}

export interface BaseSelect {}

defineOptions({
  name: "BaseSelect",
  inheritAttrs: false,
});

const props = defineProps<BaseSelectProps>();
const emits = defineEmits<BaseSelectEmits>();
const selectedGroupElement = ref<HTMLElement | null>(null);
const optionsGroupElement = ref<HTMLElement | null>(null);
const selectedValues = new Set<string>();

// prima ordinare per ordine alfabetico
// poi ordinare per selezionati o no
// bingo madaffaka

function handleClickEvent(e: Event) {
  if (
    e.target instanceof HTMLOptionElement === false ||
    selectedGroupElement.value === null ||
    optionsGroupElement.value === null
  ) {
    return;
  }

  const optionElement = e.target;
  optionElement.classList.remove("base-select--selected");
  optionElement.classList.remove("base-select--unselected");

  try {
    selectedGroupElement.value.removeChild(optionElement);
  } catch (error) {}

  try {
    optionsGroupElement.value.removeChild(optionElement);
  } catch (error) {}

  if (selectedValues.has(optionElement.value)) {
    selectedValues.delete(optionElement.value);
    optionsGroupElement.value.appendChild(optionElement);
    optionElement.classList.add("base-select--unselected");
  } else {
    selectedValues.add(optionElement.value);
    selectedGroupElement.value.appendChild(optionElement);
    optionElement.classList.add("base-select--selected");
  }
}

// function handleClickEvent(e: Event) {
//   if (
//     e.target instanceof HTMLOptionElement === false ||
//     wrapperElement.value === null
//   ) {
//     return;
//   }

//   const { value } = e.target;
//   e.target.classList.remove("base-select--selected");
//   wrapperElement.value.removeChild(e.target);

//   if (selectedValues.has(value)) {
//     wrapperElement.value.appendChild(e.target);
//     selectedValues.delete(value);
//   } else {
//     e.target.classList.add("base-select--selected");
//     wrapperElement.value.prepend(e.target);
//     selectedValues.add(value);
//   }
// }
</script>

<template>
  <div class="base-select" @click="handleClickEvent" ref="wrapperElement">
    <div
      class="base-select__group base-select__selected"
      ref="selectedGroupElement"
    ></div>
    <div
      class="base-select__group base-select__options"
      ref="optionsGroupElement"
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
  border-radius: wtk.get("border", "radius");
  padding: wtk.get("spacing", "sm");
  gap: wtk.get("spacing", "xs");

  &__group {
    flex-wrap: wrap;
    display: flex;
    gap: wtk.get("spacing", "xs");

    &:empty {
      display: none;
    }
  }

  option {
    flex-grow: 1;
    border-radius: inherit;
    padding: 0.15rem 0.3rem;
    min-width: min(20%, 100px);
    text-align: center;
    background-color: var(--color-input-handle);
    cursor: pointer;

    &.base-select--selected {
      animation: zoom-in 200ms ease forwards, fade-in 200ms ease forwards;
      border-radius: wtk.get("border", "radius");
      background-color: var(--color-input-active);
    }

    &.base-select--unselected {
      animation: zoom-out 200ms ease forwards, fade-in 200ms ease forwards;
    }
  }

  select {
    position: absolute;
    z-index: -1;
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
