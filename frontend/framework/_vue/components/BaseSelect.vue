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
const wrapperElement = ref<HTMLElement | null>(null);
const selectedValues = new Set<string>();

function manageElement(optionElement: HTMLOptionElement, action: -1 | 1) {
  if (wrapperElement.value === null) {
    return;
  }

  wrapperElement.value.removeChild(optionElement);

  if (action === -1) {
    wrapperElement.value.appendChild(optionElement);
    optionElement.classList.remove("base-select--selected");
    selectedValues.add(optionElement.value);
  } else {
    wrapperElement.value.prepend(optionElement);
    optionElement.classList.add("base-select--selected");
    selectedValues.delete(optionElement.value);
  }
}

function handleClickEvent(e: Event) {
  if (e.target instanceof HTMLOptionElement === false) {
    return;
  }

  const { value } = e.target;

  if (selectedValues.has(value)) {
    manageElement(e.target, -1);
  } else {
    manageElement(e.target, +1);
  }
}
</script>

<template>
  <div class="base-select" @click="handleClickEvent" ref="wrapperElement">
    <TransitionGroup>
      <slot></slot>
    </TransitionGroup>
  </div>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-select {
  @include theme.set-color-scheme("input");

  position: relative;
  flex-wrap: wrap;
  display: flex;
  border: wtk.get("border");
  border-radius: wtk.get("border", "radius");
  padding: wtk.get("spacing", "sm");
  gap: wtk.get("spacing", "xs");

  option {
    flex-grow: 1;
    border-radius: inherit;
    padding: 0.15rem 0.3rem;
    min-width: 20%;
    text-align: center;
    background-color: var(--color-input-handle);
    cursor: pointer;

    &.base-select--selected {
      background-color: var(--color-input-active);
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
