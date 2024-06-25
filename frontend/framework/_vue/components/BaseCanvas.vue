<script setup lang="ts">
// define device type on enter
// swap pan type accordingly
// move BaseCanvas to app folder

import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { onMounted, onUnmounted, reactive, ref, type Ref } from "vue";

export interface BaseCanvasProps {
  maxHistoryLength?: number;
  canvasTool?: BaseCanvasTool;
}

export interface BaseCanvasEmits {
  (e: "base-canvas:interaction-start", canvasTool: BaseCanvasTool): void;
  (e: "base-canvas:interaction-end", canvasTool: BaseCanvasTool): void;
}

export interface BaseCanvas {
  canvasElement: Ref<HTMLCanvasElement | null>;
  canvasContext: Ref<CanvasRenderingContext2D | null>;
  canvasZoom: Ref<number>;
  canvasHistory: CanvasHistory;
  setZoom: (value: number) => number;
  restoreCanvasHistoryPoint: (index: number) => boolean;
  exportAsImage: (
    fileName: string,
    fileExtension: "jpg" | "jpeg" | "png"
  ) => void;
}

export interface BaseCanvasTool {
  toolName: string;
  handleInteractionStart?: InteractionHandler;
  handleInteraction?: InteractionHandler;
  handleInteractionEnd?: InteractionHandler;
  [key: string]: any;
}

export type InteractionHandler = (
  e: PointerEvent,
  data: InteractionData
) => void;

export type InteractionData = {
  x: number;
  y: number;
  pointerHistory: PointerHistory;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
};

export type CanvasHistory = {
  timestamp: number;
  canvasTool: BaseCanvasTool;
  imageData: ImageData;
}[];

type PointerHistory = { timestamp: number; x: number; y: number }[];

enum InteractionStatus {
  "Start",
  "Active",
  "End",
}

defineOptions({
  name: "BaseCanvas",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseCanvasProps>(), {
  maxHistoryLength: 10,
});
const emits = defineEmits<BaseCanvasEmits>();
const wrapperElement = ref<HTMLElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const canvasZoom = ref(1);
const canvasHistory = reactive<CanvasHistory>([]);
const canvasHistoryIndex = ref(0);
const pointerId = ref<number | null>(null);
const pointerIsOver = ref(false);
const pointerIsActive = ref(false);
const pointerHistory = reactive<PointerHistory>([]);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function handleInteraction(e: PointerEvent, status: InteractionStatus) {
  if (
    canvasElement.value === null ||
    canvasContext.value === null ||
    props.canvasTool === undefined
  ) {
    return;
  }

  const { left, width, top, height } =
    canvasElement.value.getBoundingClientRect();
  const x = (e.clientX - left) * (canvasElement.value.width / width);
  const y = (e.clientY - top) * (canvasElement.value.height / height);
  pointerHistory.push({ timestamp: Date.now(), x, y });
  const data: InteractionData = {
    x,
    y,
    pointerHistory,
    canvasElement: canvasElement.value,
    canvasContext: canvasContext.value,
  };

  switch (status) {
    case InteractionStatus.Start:
      props.canvasTool.handleInteractionStart?.(e, data);
    case InteractionStatus.Active:
      props.canvasTool.handleInteraction?.(e, data);

      break;
    case InteractionStatus.End:
      props.canvasTool.handleInteractionEnd?.(e, data);
      pointerHistory.length = 0;
      updateCanvasHistory();

      break;
  }
}

function setZoom(value: number) {
  if (canvasElement.value === null) {
    return -1;
  }

  value = Math.max(Math.min(value, 5), 0.1);
  canvasZoom.value = value;
  canvasElement.value.style.scale = canvasZoom.value.toString();

  return canvasZoom.value;
}

function updateCanvasHistory() {
  if (
    props.maxHistoryLength <= 0 ||
    canvasElement.value === null ||
    canvasContext.value === null ||
    props.canvasTool === undefined
  ) {
    return;
  }

  if (
    canvasHistoryIndex.value !== canvasHistory.length - 1 &&
    canvasHistory.length !== 0
  ) {
    canvasHistory.splice(canvasHistoryIndex.value);
  }

  const { width, height } = canvasElement.value;
  canvasHistory.push({
    timestamp: Date.now(),
    canvasTool: props.canvasTool,
    imageData: canvasContext.value.getImageData(0, 0, width, height),
  });
}

function restoreCanvasHistoryPoint(index: number) {
  if (
    index < 0 ||
    index > canvasHistory.length - 1 ||
    canvasElement.value === null ||
    canvasContext.value === null
  ) {
    return false;
  }

  const data = canvasHistory[index];
  const { width, height } = canvasElement.value;
  canvasContext.value.clearRect(0, 0, width, height);
  canvasContext.value.putImageData(data.imageData, 0, 0);
  canvasHistoryIndex.value = index;

  return true;
}

function exportAsImage(
  fileName: string,
  fileExtension: "jpg" | "jpeg" | "png"
) {
  if (canvasElement.value === null) {
    throw new Error("canvas_element_not_mounted");
  }

  const dataUrl = canvasElement.value.toDataURL(`image/${fileExtension}`);
  const url = dataUrl.replace(
    /^data:image\/png/,
    "data:application/octet-stream"
  );
  const linkElement = document.createElement("a");
  linkElement.setAttribute("download", `${fileName}.${fileExtension}`);
  linkElement.setAttribute("href", url);
  linkElement.click();
}

function handlePointerEnterEvent(e: PointerEvent) {
  if (pointerId.value !== null) {
    return;
  }

  pointerId.value = e.pointerId;
  pointerIsOver.value = true;
}

function handlePointerMoveEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId || pointerIsActive.value === false) {
    return;
  }

  handleInteraction(e, InteractionStatus.Active);
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
  handleInteraction(e, InteractionStatus.Start);
}

function handlePointerUpEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = false;
  handleInteraction(e, InteractionStatus.End);
}

onMounted(() => {
  if (canvasElement.value === null) {
    throw new Error("unable_to_mount_canvas_element");
  }

  canvasContext.value = canvasElement.value.getContext("2d");
  window.addEventListener("pointerup", handlePointerUpEvent);
});

onUnmounted(() => {
  window.removeEventListener("pointerup", handlePointerUpEvent);
});

defineExpose<BaseCanvas>({
  canvasElement,
  canvasContext,
  canvasZoom,
  canvasHistory,
  restoreCanvasHistoryPoint,
  setZoom,
  exportAsImage,
});
</script>

<template>
  <div class="base-canvas" v-bind="styleAttrs" ref="wrapperElement">
    <canvas
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
  overflow: auto;
  touch-action: none;
  
  canvas {
    cursor: crosshair;
  }
}
</style>
