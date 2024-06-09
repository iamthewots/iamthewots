<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface BaseHoverBoxProps {
  resetOnLeave?: boolean;
}

export interface BaseHoverBoxEmits {
  (e: "base-hover-box:hover-start"): void;
  (e: "base-hover-box:hover-end"): void;
  (e: "base-hover-box:pointer-enter", pointerData: PointerData): void;
  (e: "base-hover-box:pointer-leave", pointerData: PointerData): void;
}

export interface BaseHoverBox {
  hoverBoxElement: Ref<HTMLElement | null>;
  getHoverBoxData: () =>
    | { hoverBoxElement: HTMLElement; pointersDataArray: PointerData[] }
    | undefined;
}

interface PointerData {
  index: number;
  props: PointerDataProps;
}

interface PointerDataProps {
  x: number;
  y: number;
  angle: number;
  distance: number;
}

defineOptions({
  name: "BaseHoverBox",
  inheritAttrs: false,
});

const props = defineProps<BaseHoverBoxProps>();
const emits = defineEmits<BaseHoverBoxEmits>();
const hoverBoxElement = ref<HTMLElement | null>(null);
const hoverBoxIsActive = ref(false);
const pointersDataMap = new Map<number, PointerData>();
const hoverBoxElementClassList = computed(() => {
  return {
    "base-hover-box": true,
    "base-hover-box--active": hoverBoxIsActive.value,
    "base-hover-box--inactive": !hoverBoxIsActive.value,
  };
});

function getHoverBoxData() {
  if (hoverBoxElement.value === null) {
    return;
  }

  const pointersDataArray = Array.from(pointersDataMap)
    .map((keyAndValueArray) => {
      return keyAndValueArray[1];
    })
    .sort((a, b) => (a.index > b.index ? 1 : -1));

  return {
    hoverBoxElement: hoverBoxElement.value,
    pointersDataArray,
  };
}

function updatePointerData(e: PointerEvent) {
  const pointerData = pointersDataMap.get(e.pointerId);

  if (pointerData === undefined || hoverBoxElement.value === null) {
    return;
  }

  const { left, width, top, height } =
    hoverBoxElement.value.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 2 - 1;
  const y = ((e.clientY - top) / height) * 2 - 1;
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 1.414;

  pointerData.props = { x, y, angle, distance };
  updateCssProperties(pointerData);
}

function updateCssProperties(pointerData: PointerData) {
  if (hoverBoxElement.value === null) {
    return;
  }

  let key: keyof PointerDataProps;
  for (key in pointerData.props) {
    const propertyName = `--pointer-${pointerData.index}-${key}`;
    const propertyValue = pointerData.props[key].toString();
    hoverBoxElement.value.style.setProperty(propertyName, propertyValue);
  }
}

function handlePointerEnterEvent(e: PointerEvent) {
  if (pointersDataMap.has(e.pointerId)) {
    return;
  }

  const pointerData: PointerData = {
    index: pointersDataMap.size,
    props: {
      x: 0,
      y: 0,
      angle: 0,
      distance: 0,
    },
  };
  pointersDataMap.set(e.pointerId, pointerData);
  emits("base-hover-box:pointer-enter", pointerData);
  hoverBoxIsActive.value = true;

  if (pointersDataMap.size === 1) {
    emits("base-hover-box:hover-start");
  }
}

function handlePointerMoveEvent(e: PointerEvent) {
  if (hoverBoxElement.value === null) {
    return;
  }

  const { x, width, y, height } = hoverBoxElement.value.getBoundingClientRect();
  const pointerIsInsideHoverBoxElement =
    e.clientX >= x &&
    e.clientX <= x + width &&
    e.clientY >= y &&
    e.clientY <= y + height;

  if (pointerIsInsideHoverBoxElement) {
    updatePointerData(e);
  }
}

function handlePointerLeaveEvent(e: PointerEvent) {
  const pointerData = pointersDataMap.get(e.pointerId);

  if (pointerData === undefined) {
    return;
  }

  if (props.resetOnLeave) {
    updateCssProperties({
      index: pointerData.index,
      props: {
        x: 0,
        y: 0,
        angle: 0,
        distance: 0,
      },
    });
  }

  if (pointerData.index === 0) {
    pointersDataMap.clear();
  }

  emits("base-hover-box:pointer-leave", pointerData);

  if (pointersDataMap.size === 0) {
    emits("base-hover-box:hover-end");
    hoverBoxIsActive.value = false;
  }
}

function handleResizeEventFromWindow() {
  if (hoverBoxElement.value === null) {
    return;
  }

  const { width, height } = hoverBoxElement.value.getBoundingClientRect();
  const hoverBoxProps: { [key: string]: string } = {
    width: `${width}px`,
    height: `${height}px`,
    "x-multiplier": `${width / 2}px`,
    "y-multiplier": `${height / 2}px`,
  };

  for (const propertyName in hoverBoxProps) {
    const propertyValue = hoverBoxProps[propertyName];
    hoverBoxElement.value.style.setProperty(
      `--hover-box-${propertyName}`,
      propertyValue
    );
  }
}

onMounted(() => {
  handleResizeEventFromWindow();
  window.addEventListener("resize", handleResizeEventFromWindow);
});

onBeforeUnmount(() =>
  window.removeEventListener("resize", handleResizeEventFromWindow)
);

defineExpose({ hoverBoxElement, getHoverBoxData });
</script>

<template>
  <div
    :class="hoverBoxElementClassList"
    @pointerenter="handlePointerEnterEvent"
    @pointermove="handlePointerMoveEvent"
    @pointerleave="handlePointerLeaveEvent"
    v-bind="$attrs"
    ref="hoverBoxElement"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
.base-hover-box {
  touch-action: none;
  position: relative;

  &__content {
    position: absolute;
    inset: 0;
  }
}
</style>
