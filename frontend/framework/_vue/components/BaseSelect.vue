<script setup lang="ts">
import { onMounted, ref } from "vue";

export interface BaseSelectProps {
  selectMax?: number;
  selectedOptionClass?: string;
  unselectedOptionClass?: string;
  sortFunction?: (a: HTMLOptionElement, b: HTMLOptionElement) => number;
}

export interface BaseSelectEmits {
  (e: "update:modelValue", values: string[]): void;
  (
    e: "base-select:change",
    selectedValues: string[],
    unselectedValues: string[]
  ): void;
  (e: "base-select:select", value: string): void;
  (e: "base-select:unselect", value: string): void;
}

export interface BaseSelect {
  optionValues: {
    selected: Set<string>;
    unselected: Set<string>;
  };
}

defineOptions({
  name: "BaseSelect",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseSelectProps>(), {
  selectMax: 1,
  selectedOptionClass: "base-select__option--selected",
  unselectedOptionClass: "base-select__option--unselected",
  sortFunction: (a, b) => (a.innerText > b.innerText ? 1 : -1),
});
const emits = defineEmits<BaseSelectEmits>();
const selectedOptionsElement = ref<HTMLElement | null>(null);
const unselectedOptionsElement = ref<HTMLElement | null>(null);
const optionValues = {
  selected: new Set<string>(),
  unselected: new Set<string>(),
};

function changeSelection(
  optionElement: HTMLOptionElement,
  action: "select" | "unselect"
) {
  if (
    selectedOptionsElement.value === null ||
    unselectedOptionsElement.value === null ||
    (action === "select" && optionValues.selected.size >= props.selectMax)
  ) {
    return;
  }

  if (action === "select") {
    optionElement.selected = true;
    optionValues.unselected.delete(optionElement.value);
    unselectedOptionsElement.value.removeChild(optionElement);
    optionValues.selected.add(optionElement.value);
    selectedOptionsElement.value.appendChild(optionElement);
    emits("base-select:select", optionElement.value);
  } else {
    optionElement.selected = false;
    optionValues.selected.delete(optionElement.value);
    selectedOptionsElement.value.removeChild(optionElement);
    optionValues.unselected.add(optionElement.value);
    unselectedOptionsElement.value.appendChild(optionElement);
    emits("base-select:unselect", optionElement.value);
  }

  emits("update:modelValue", [...optionValues.selected]);
  emits(
    "base-select:change",
    [...optionValues.selected],
    [...optionValues.unselected]
  );
  sortOptionElements();
  adjustOptionElementsClassList(optionElement, action);
}

function sortOptionElements() {
  if (
    unselectedOptionsElement.value === null ||
    typeof props.sortFunction !== "function"
  ) {
    return;
  }

  const optionElements = Array.from(
    unselectedOptionsElement.value.querySelectorAll("option")
  );
  optionElements.sort(props.sortFunction);
  optionElements.forEach((element) =>
    unselectedOptionsElement.value?.removeChild(element)
  );
  optionElements.forEach((element) => {
    unselectedOptionsElement.value?.appendChild(element);
  });
}

function adjustOptionElementsClassList(
  optionElement: HTMLOptionElement,
  action: "select" | "unselect"
) {
  if (
    selectedOptionsElement.value === null ||
    unselectedOptionsElement.value === null
  ) {
    return;
  }

  [selectedOptionsElement.value, unselectedOptionsElement.value].forEach(
    (parentElement) => {
      parentElement.querySelectorAll("option").forEach((element) => {
        element.classList.remove(
          props.selectedOptionClass,
          props.unselectedOptionClass
        );
      });
    }
  );
  optionElement.classList.add(
    action === "select"
      ? props.selectedOptionClass
      : props.unselectedOptionClass
  );
}

function handleClickEvent(e: Event) {
  if (
    e.target instanceof HTMLOptionElement === false ||
    selectedOptionsElement.value === null ||
    unselectedOptionsElement.value === null
  ) {
    return;
  }

  const optionElement = e.target;

  if (selectedOptionsElement.value.contains(optionElement)) {
    changeSelection(optionElement, "unselect");
  } else if (unselectedOptionsElement.value.contains(optionElement)) {
    changeSelection(optionElement, "select");
  }
}

onMounted(() => {
  if (
    selectedOptionsElement.value === null ||
    unselectedOptionsElement.value === null
  ) {
    return;
  }

  unselectedOptionsElement.value
    .querySelectorAll("option")
    .forEach((optionElement) => {
      if (optionElement.selected === true) {
        unselectedOptionsElement.value?.removeChild(optionElement);
        selectedOptionsElement.value?.appendChild(optionElement);
        optionValues.selected.add(optionElement.value);
      } else {
        optionValues.unselected.add(optionElement.value);
      }
    });
  sortOptionElements();
});

defineExpose({ optionValues });
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

  &__selected-options {
    @include theme.set-color-property("background", "input-active");
  }

  &__unselected-options {
    overflow-y: auto;
    max-height: min(50vh, 25rem);
  }

  option {
    @include theme.set-color-property("background", "input-handle");

    flex-grow: 1;
    border-radius: wtk.get("border", "radius");
    padding: wtk.get("spacing", 0.15rem) wtk.get("spacing", 0.3rem);
    min-width: min(20%, 200px);
    text-align: center;
    cursor: pointer;
  }
}

.base-select__option--selected {
  animation: zoom-in wtk.get("duration", "md") ease-out;
}

.base-select__option--unselected {
  animation: zoom-out wtk.get("duration", "md") ease-out;
}
</style>
