<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { ref, type Ref } from "vue";

export interface BaseRangeProps {
  modelValue?: number;
}

export interface BaseRangeEmits {
  (e: "update:modelValue", value: number): void;
}

export interface BaseRange {
  inputElement: Ref<HTMLInputElement | null>;
}

defineOptions({
  name: "BaseRange",
  inheritAttrs: false,
});

const props = defineProps<BaseRangeProps>();
const emits = defineEmits<BaseRangeEmits>();
const inputElement = ref<HTMLInputElement | null>(null);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleInputEvent() {
  if (inputElement.value === null) {
    return;
  }

  emits("update:modelValue", parseFloat(inputElement.value.value));
}

defineExpose<BaseRange>({ inputElement });
</script>

<template>
  <label class="base-range" v-bind="styleAttrs">
    <div class="base-range__slider">
      <div class="base-range__handle"></div>
    </div>
    <slot></slot>
    <input
      type="range"
      @input="handleInputEvent"
      v-bind="nonStyleAttrs"
      ref="inputElement"
    />
  </label>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-range {
  position: relative;
}
</style>
