<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { computed, onMounted, onUnmounted, ref } from "vue";

export interface BaseCanvasProps {
  toolSettings?: BaseCanvasToolSettings;
}

export interface BaseCanvasEmits {
  (e: "base-canvas:interaction-start", action: BaseCanvasToolAction): void;
  (e: "base-canvas:interaction-end", action: BaseCanvasToolAction): void;
}

export interface BaseCanvas {
  clear: () => void;
  setBackgroudColor: (color: string) => void;
}

export interface BaseCanvasToolSettings {
  toolName: string;
  action: BaseCanvasToolAction;
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineJoin: CanvasPathDrawingStyles["lineJoin"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color: string | CanvasPattern | CanvasGradient;
}

type BaseCanvasToolAction = "draw" | "erase";

defineOptions({
  name: "BaseCanvas",
  inheritAttrs: false,
});

const props = defineProps<BaseCanvasProps>();
const emits = defineEmits<BaseCanvasEmits>();
const canvasElement = ref<HTMLCanvasElement | null>(null);
const pointerId = ref<number | null>(null);
const pointerIsOver = ref(false);
const pointerIsActive = ref(false);
let context: CanvasRenderingContext2D | null = null;
const wrapperElementClassList = computed(() => {
  return {
    "base-canvas": true,
    "base-canvas--pointer-is-over": pointerIsOver.value,
    "base-canvas--pointer-is-active": pointerIsActive.value,
  };
});
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleCanvasInteraction(e: PointerEvent) {
  if (
    pointerIsActive.value === false ||
    props.toolSettings === undefined ||
    context === null ||
    canvasElement.value === null
  ) {
    return;
  }

  const { left, top } = canvasElement.value.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;

  switch (props.toolSettings.action) {
    case "draw":
      return draw(x, y);
    case "erase":
      return erase(x, y);
  }
}

function handleCanvasInteractionEnd() {
  if (context === null) {
    return;
  }

  context.beginPath();
}

function draw(x: number, y: number) {
  if (
    context === null ||
    props.toolSettings === undefined ||
    canvasElement.value === null
  ) {
    return;
  }

  context.lineCap = props.toolSettings.lineCap;
  context.lineJoin = props.toolSettings.lineJoin;
  context.lineWidth = props.toolSettings.lineWidth;
  context.strokeStyle = props.toolSettings.color;
  context.lineTo(x, y);
  context.stroke();
}

function erase(x: number, y: number) {
  if (
    context === null ||
    props.toolSettings === undefined ||
    canvasElement.value === null
  ) {
    return;
  }

  const { lineWidth } = props.toolSettings;

  switch (props.toolSettings.lineCap) {
    case "round":
      context.save();
      context.arc(x, y, lineWidth / 2, 0, 360);
      context.clip();
      context.clearRect(
        0,
        0,
        canvasElement.value.width,
        canvasElement.value.height
      );
      context.restore();

      break;
    case "square":
      context.clearRect(
        x - lineWidth / 2,
        y - lineWidth / 2,
        lineWidth,
        lineWidth
      );

      break;
  }
}

function clear() {}

function handlePointerEnterEvent(e: PointerEvent) {
  if (pointerId.value !== null) {
    return;
  }

  pointerId.value = e.pointerId;
  pointerIsOver.value = true;
}

function handlePointerMoveEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  handleCanvasInteraction(e);
}

function handlePointerLeaveEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerId.value = null;
  pointerIsOver.value = false;
}

function handlePointerDownEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = true;
}

function handlePointerUpEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = false;
  handleCanvasInteractionEnd();
}

onMounted(() => {
  if (canvasElement.value === null) {
    return;
  }

  window.addEventListener("pointerup", handlePointerUpEvent);
  context = canvasElement.value.getContext("2d");
});

onUnmounted(() =>
  window.removeEventListener("pointerup", handlePointerUpEvent)
);
</script>

<template>
  <div :class="wrapperElementClassList" v-bind="styleAttrs">
    <canvas
      width="500"
      height="400"
      @pointerenter="handlePointerEnterEvent"
      @pointermove="handlePointerMoveEvent"
      @pointerleave="handlePointerLeaveEvent"
      @pointerdown="handlePointerDownEvent"
      v-bind="nonStyleAttrs"
      ref="canvasElement"
    ></canvas>
  </div>
</template>

<style lang="scss">
.base-canvas {
  touch-action: none;

  canvas {
    border: 1px solid black;
    cursor: crosshair;
  }
}
</style>
