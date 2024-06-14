<script setup lang="ts">
import { onMounted, ref } from "vue";

export interface BaseSelectProps {
  selectMax?: number;
  selectedOptionClass?: string;
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
  optionsValues: {
    selected: Set<string>;
    notSelected: Set<string>;
  };
}

defineOptions({
  name: "BaseSelect",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseSelectProps>(), {
  selectMax: 1,
  selectedOptionClass: "base-select__option--selected",
  sortFunction: (a, b) => (a.innerText > b.innerText ? 1 : -1),
});
const emits = defineEmits<BaseSelectEmits>();
const selectedOptionsElement = ref<HTMLElement | null>(null);
const notSelectedOptionsElement = ref<HTMLElement | null>(null);
const optionsValues = {
  selected: new Set<string>(),
  notSelected: new Set<string>(),
};

function changeSelection(
  optionElement: HTMLOptionElement,
  action: "select" | "unselect"
) {
  if (
    selectedOptionsElement.value === null ||
    notSelectedOptionsElement.value === null ||
    (action === "select" && optionsValues.selected.size >= props.selectMax)
  ) {
    return;
  }

  if (action === "select") {
    optionElement.selected = true;
    optionsValues.notSelected.delete(optionElement.value);
    optionsValues.selected.add(optionElement.value);
    const clonedOptionElement = optionElement.cloneNode(
      true
    ) as HTMLOptionElement;
    clonedOptionElement.classList.add(props.selectedOptionClass);
    selectedOptionsElement.value.appendChild(clonedOptionElement);
    emits("base-select:select", optionElement.value);
  }

  if (action === "unselect") {
    optionElement.selected = false;
    optionsValues.selected.delete(optionElement.value);
    optionsValues.notSelected.add(optionElement.value);
    selectedOptionsElement.value.removeChild(optionElement);
    emits("base-select:unselect", optionElement.value);
  }

  emits("update:modelValue", [...optionsValues.selected]);
  emits(
    "base-select:change",
    [...optionsValues.selected],
    [...optionsValues.notSelected]
  );
}

function sortNotSelectedOptions() {
  if (
    notSelectedOptionsElement.value === null ||
    typeof props.sortFunction !== "function"
  ) {
    return;
  }

  const optionElements = Array.from(
    notSelectedOptionsElement.value.querySelectorAll("option")
  );
  optionElements.sort(props.sortFunction);
  optionElements.forEach((element) =>
    notSelectedOptionsElement.value?.removeChild(element)
  );
  optionElements.forEach((element) => {
    notSelectedOptionsElement.value?.appendChild(element);
  });
}

function handleClickEvent(e: Event) {
  if (
    e.target instanceof HTMLOptionElement === false ||
    selectedOptionsElement.value === null ||
    notSelectedOptionsElement.value === null
  ) {
    return;
  }

  const optionElement = e.target;

  if (selectedOptionsElement.value.contains(optionElement)) {
    changeSelection(optionElement, "unselect");
  } else if (notSelectedOptionsElement.value.contains(optionElement)) {
    changeSelection(optionElement, "select");
  }
}

onMounted(() => {
  if (
    selectedOptionsElement.value === null ||
    notSelectedOptionsElement.value === null
  ) {
    return;
  }

  notSelectedOptionsElement.value
    .querySelectorAll("option")
    .forEach((optionElement) => {
      if (optionElement.selected === true) {
        selectedOptionsElement.value?.appendChild(
          optionElement.cloneNode(true)
        );
        optionsValues.selected.add(optionElement.value);
      } else {
        optionsValues.notSelected.add(optionElement.value);
      }
    });
  sortNotSelectedOptions();
});

defineExpose<BaseSelect>({ optionsValues });
</script>

<template>
  <div class="base-select" @click="handleClickEvent" v-bind="$attrs">
    <div
      class="base-select__group base-select__selected-options"
      ref="selectedOptionsElement"
    ></div>
    <div
      class="base-select__group base-select__unselected-options"
      ref="notSelectedOptionsElement"
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
    padding: wtk.get("spacing", "xs");
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

    place-items: center;
    flex-grow: 1;
    display: grid;
    padding-inline: wtk.get("spacing", "xs");
    min-width: min(20%, 200px);
    height: wtk.get("height", "input");
    text-align: center;
    cursor: pointer;
  }
}

.base-select__option--selected {
  animation: none;
}
</style>
