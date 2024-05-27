<script setup lang="ts">
import { ref } from "vue";

export interface BaseHoverBoxProps {
  multiplePointers?: boolean;
  resetOnPointerLeave?: boolean;
}

export interface BaseHoverBoxEmits {
  (e: "wtk:base-hover-box:hover-start"): void;
  (e: "wtk:base-hover-box:hover-end"): void;
  (e: "wtk:base-hover-box:pointer-enter", value: PointerData): void;
  (e: "wtk:base-hover-box:pointer-leave", value: PointerData): void;
}

export interface BaseHoverBox {
  pointersMap: Map<number, PointerData>;
  updateCssVariables: (index: number, x: number, y: number) => void;
}

interface PointerData {
  index: number;
  x: number;
  y: number;
}

const props = withDefaults(defineProps<BaseHoverBoxProps>(), {
  resetOnPointerLeave: true,
});
const emit = defineEmits<BaseHoverBoxEmits>();
const hoverBoxElement = ref<HTMLElement | null>(null);
const pointersMap = new Map<number, PointerData>();

function updatePointerData(e: PointerEvent) {
  const pointerData = pointersMap.get(e.pointerId);

  if (pointerData === undefined || hoverBoxElement.value === null) {
    return;
  }

  const { left, top, width, height } =
    hoverBoxElement.value.getBoundingClientRect();
  pointerData.x = ((e.clientX - left) / width) * 2 - 1;
  pointerData.y = ((e.clientY - top) / height) * 2 - 1;
  updateCssVariables(pointerData.index, pointerData.x, pointerData.y);
}

function updateCssVariables(index: number, x: number, y: number) {
  if (hoverBoxElement.value === null) {
    return;
  }

  const cssVarPrefix = `--pointer-${index}`;
  const cssVarsValues: { [key: string]: string } = {
    x: x.toString(),
    y: y.toString(),
    angle: Math.atan2(y, x).toString(),
    distance: Math.max(
      Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) - 0.4142,
      0
    ).toString(),
  };

  for (const key in cssVarsValues) {
    const value = cssVarsValues[key];
    hoverBoxElement.value.style.setProperty(`${cssVarPrefix}-${key}`, value);
  }
}

function addPointer(e: PointerEvent) {
  const pointerData = { index: pointersMap.size, x: 0, y: 0 };
  pointersMap.set(e.pointerId, pointerData);
}

function handlePointerEnter(e: PointerEvent) {
  if (
    pointersMap.has(e.pointerId) ||
    (pointersMap.size > 0 && props.multiplePointers === false)
  ) {
    return;
  }

  // emit pointer-enter
  // emit hover-start

  addPointer(e);
}

function handlePointerMove(e: PointerEvent) {
  if (pointersMap.has(e.pointerId) === false) {
    return;
  }

  updatePointerData(e);
}

function handlePointerLeave(e: PointerEvent) {
  const pointerData = pointersMap.get(e.pointerId);

  if (pointerData === undefined) {
    return;
  }

  if (pointerData.index === 0) {
    pointersMap.clear();
  } else {
    pointersMap.delete(e.pointerId);
  }

  // emit pointer-leave

  if (pointersMap.size === 0) {
    // emit hover-end
  }

  if (props.resetOnPointerLeave) {
    updateCssVariables(pointerData.index, 0, 0);
  }
}

defineExpose({ updateCssVariables });
</script>

<template>
  <div
    class="base-hover-box"
    @pointerenter="handlePointerEnter"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    ref="hoverBoxElement"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
.base-hover-box {
  touch-action: none;
}
</style>
