<script setup lang="ts">
import { ref } from "vue";

export interface BaseHoverBoxProps {
  multiplePointers?: boolean;
  resetOnPointerLeave?: boolean;
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

const props = defineProps<BaseHoverBoxProps>();
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
  const cssVarsValues = {
    x: x.toString(),
    y: x.toString(),
    angle: Math.atan2(y, x).toString(),
    distance: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toString(),
  };

  for (const key in cssVarsValues) {
    const value = cssVarsValues[key];
    hoverBoxElement.value.style.setProperty(`${cssVarPrefix}-${key}`, value);
  }
}

function addPointer(e: PointerEvent) {
  if (
    pointersMap.has(e.pointerId) ||
    (pointersMap.size > 0 && props.multiplePointers === false)
  ) {
    return;
  }

  const pointerData = { index: pointersMap.size, x: 0, y: 0 };
  pointersMap.set(e.pointerId, pointerData);
}

function handlePointerEnter(e: PointerEvent) {
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

@keyframes base-hover-box-3d-effect {
  from {
    rotate: 0 0;
  }
  to {
    $pointer-x: var(--base-hover-box-pointer-1-x);
    $pointer-y: var(--base-hover-box-pointer-1-y);
    $rotate-x: var(--rotate-x, 25deg);
    $rotate-y: var(--rotate-y, 25deg);

    rotate: calc($pointer-y * $rotate-x * -1);
    rotate: calc($pointer-x * $rotate-y);
  }
}

@keyframes base-hover-box-parallax-effect {
  from {
    rotate: 0 0;
    scale: 1;
    translate: 0 0;
  }
  to {
    $pointer-x: var(--base-hover-box-pointer-1-x);
    $pointer-y: var(--base-hover-box-pointer-1-y);
    $pointer-distance: var(--base-hover-box-pointer-1-distance);
    $rotate-x: var(--rotate-x, 10deg);
    $rotate-y: var(--rotate-y, 10deg);
    $scale: var(--scale, 0.9);
    $translate-x: var(--translate-x, 2.5rem);
    $translate-y: var(--translate-y, 2.5rem);

    rotate: calc($pointer-y * $rotate-x * -1);
    rotate: calc($pointer-x * $rotate-y);
    scale: calc($scale + $pointer-distance * (1 - $scale));
  }
}
</style>
