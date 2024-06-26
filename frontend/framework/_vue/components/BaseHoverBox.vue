<script setup lang="ts">
import {
  trackPointerFromElement,
  type PointerProps,
} from "@_lib/pointer-tracker";
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface BaseHoverBoxProps {
  tag?: string;
  removeClamps?: boolean;
  resetOnLeave?: boolean;
}

export interface BaseHoverBoxEmits {
  (e: "base-hover-box:hover-start"): void;
  (e: "base-hover-box:hover-end"): void;
  (e: "base-hover-box:pointer-enter", pointerData: PointerData): void;
  (e: "base-hover-box:pointer-leave", pointerData: PointerData): void;
}

interface PointerData {
  index: number;
  props: PointerProps;
}

defineOptions({
  name: "BaseHoverBox",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseHoverBoxProps>(), {
  tag: "div",
});
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

  pointerData.props = trackPointerFromElement(e, hoverBoxElement.value);
  updateCssProperties(pointerData);
}

function updateCssProperties(pointerData: PointerData) {
  if (hoverBoxElement.value === null) {
    return;
  }

  let key: keyof PointerProps;
  for (key in pointerData.props) {
    let value = pointerData.props[key];

    if (props.removeClamps !== true) {
      value = Math.min(Math.max(-1, value), 1);
    }

    const propertyName = `--pointer-${pointerData.index}-${key}`;
    const propertyValue = value.toString();
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
  updatePointerData(e);
}

function handlePointerLeaveEvent(e: PointerEvent) {
  const pointerData = pointersDataMap.get(e.pointerId);

  if (pointerData === undefined) {
    return;
  }

  pointersDataMap.delete(e.pointerId);

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

  pointersDataMap.delete(e.pointerId);

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

export interface BaseHoverBox {
  hoverBoxElement: (typeof hoverBoxElement)["value"];
  getHoverBoxData: typeof getHoverBoxData;
}
defineExpose({ hoverBoxElement, getHoverBoxData });
</script>

<template>
  <component
    :is="tag"
    :class="hoverBoxElementClassList"
    v-bind="$attrs"
    ref="hoverBoxElement"
  >
    <slot></slot>
    <div
      class="base-hover-box__tracker"
      @pointerenter="handlePointerEnterEvent"
      @pointermove="handlePointerMoveEvent"
      @pointerleave="handlePointerLeaveEvent"
      @pointercancel="handlePointerLeaveEvent"
      @pointerout="handlePointerLeaveEvent"
    ></div>
  </component>
</template>

<style lang="scss">
.base-hover-box {
  touch-action: none;
  position: relative;

  &__tracker {
    position: absolute;
    inset: 0;
    opacity: 0;
  }
}
</style>
