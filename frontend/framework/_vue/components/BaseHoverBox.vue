<script setup lang="ts">
import { computed, ref } from "vue";

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
const hoverBoxIsActive = ref(false);
const pointersMap = new Map<number, PointerData>();

const hoverBoxElementClassList = computed(() => {
  return {
    "base-hover-box": true,
    [`base-hover-box--${hoverBoxIsActive.value ? "active" : "inactive"}`]: true,
  };
});

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

  return pointerData;
}

function handlePointerEnter(e: PointerEvent) {
  if (
    pointersMap.has(e.pointerId) ||
    (pointersMap.size > 0 && props.multiplePointers === false)
  ) {
    return;
  }

  hoverBoxIsActive.value = true;

  if (pointersMap.size === 0) {
    emit("wtk:base-hover-box:hover-start");
  }

  const pointerData = addPointer(e);
  emit("wtk:base-hover-box:pointer-enter", pointerData);
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

  emit("wtk:base-hover-box:pointer-leave", pointerData);

  if (pointersMap.size === 0) {
    emit("wtk:base-hover-box:hover-end");
    hoverBoxIsActive.value = false;
  }

  if (props.resetOnPointerLeave) {
    updateCssVariables(pointerData.index, 0, 0);
  }
}

defineExpose({ updateCssVariables });
</script>

<template>
  <div
    :class="hoverBoxElementClassList"
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

$transform-3d-effect: rotateX(
    calc(var(--pointer-0-y) * var(--rotate-x, 25deg) * -1)
  )
  rotateY(calc(var(--pointer-0-x) * var(--rotate-y, 25deg)));

@keyframes base-hover-box-3d-effect-on {
  from {
    transform: none;
  }
  to {
    transform: $transform-3d-effect;
  }
}

@keyframes base-hover-box-3d-effect-off {
  from {
    transform: $transform-3d-effect;
  }
  to {
    transform: rotate(0deg, 0deg);
  }
}
</style>
