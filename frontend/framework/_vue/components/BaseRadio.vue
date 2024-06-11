<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { ref, type Ref } from "vue";

export interface BaseRadioProps {
  modelValue?: boolean;
}

export interface BaseRadioEmits {
  (e: "update:modelValue", checked: boolean): void;
  (e: "base-radio:selected"): void;
  (e: "base-radio:unselected"): void;
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

function handleInputEvent(e: Event) {
  const { checked } = e.target as HTMLInputElement;
  emits("update:modelValue", checked);

  if (checked) {
    emits("base-radio:selected");
  } else {
    emits("base-radio:unselected");
  }
}

defineExpose({ inputElement });
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
      :checked="modelValue"
      @input="handleInputEvent"
      v-bind="nonStyleAttrs"
      ref="inputElement"
    />
  </label>
</template>

<style lang="scss">
</style>
