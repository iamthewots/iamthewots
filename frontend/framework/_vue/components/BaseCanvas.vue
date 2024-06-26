<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

export interface BaseCanvasProps {
  historyMaxLength?: number;
  canvasTool?: CanvasTool;
}

export interface BaseCanvasEmits {
  (e: "base-canvas:tool-select", canvasTool?: CanvasTool): void;
  (e: "base-canvas:tool-deselect", canvasTool?: CanvasTool): void;
  (e: "base-canvas:interaction-start"): void;
  (e: "base-canvas:interaction-end"): void;
}

export interface BaseCanvas {
  wrapperElement: typeof wrapperElement;
  canvasElement: typeof canvasElement;
  canvasContext: typeof canvasContext;
  canvasHistory: typeof canvasHistory;
  canvasHistoryIndex: typeof canvasHistoryIndex;
  clearCanvas: typeof clearCanvas;
  zoomCanvas: typeof zoomCanvas;
  saveCanvasAsImage: typeof saveCanvasAsImage;
  restoreCanvasFromHistory: typeof restoreCanvasFromHistory;
}

export interface CanvasTool {
  name: string;
  doNotUpdateHistory?: boolean;
  handleSelection?: CanvasToolSelectionHandler;
  handleDeselection?: CanvasToolSelectionHandler;
  handleInteractionStart?: CanvasInteractionHandler;
  handleInteraction?: CanvasInteractionHandler;
  handleInteractionEnd?: CanvasInteractionHandler;
}

export type CanvasToolSelectionHandler = (data: {
  wrapperElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
}) => void;

export type CanvasInteractionHandler = (
  e: PointerEvent,
  data: CanvasInteractionData
) => void;

export interface CanvasInteractionData {
  x: number;
  y: number;
  pointerHistory: typeof pointerHistory;
  wrapperElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
}

enum InteractionStep {
  "Start",
  "Ongoing",
  "End",
}

defineOptions({
  name: "BaseCanvas",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseCanvasProps>(), {
  historyMaxLength: 10,
});
const emits = defineEmits<BaseCanvasEmits>();
const wrapperElement = ref<HTMLElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const canvasZoom = ref(1);
const canvasHistory = reactive<
  { details: CanvasTool | string; imageData: ImageData; timestamp: number }[]
>([]);
const canvasHistoryIndex = ref(0);
const pointerId = ref<number | null>(null);
const pointerType = ref<"mouse" | "pen" | "touch" | "unknown">("unknown");
const pointerIsOver = ref(false);
const pointerIsActive = ref(false);
const pointerHistory = reactive<{ x: number; y: number; timestamp: number }[]>(
  []
);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();

function clearCanvas() {
  if (canvasElement.value === null || canvasContext.value === null) {
    return;
  }

  const { width, height } = canvasElement.value;
  canvasContext.value.clearRect(0, 0, width, height);
  updateCanvasHistory("clear_canvas");
}

function zoomCanvas(value: number) {
  if (canvasElement.value === null) {
    return;
  }

  value = Math.max(Math.min(value, 5), 0.1);
  canvasElement.value.style.scale = value.toString();
  canvasZoom.value = value;
}

function saveCanvasAsImage(fileName: string, fileExtension: string) {
  if (canvasElement.value === null || canvasContext.value === null) {
    throw new Error("canvas_element_not_mounted");
  }

  const dataUrl = canvasElement.value.toDataURL(`image/${fileExtension}`);
  const url = dataUrl.replace(
    /^data:image\/png/,
    "data:application/octet-stream"
  );
  const anchorElement = document.createElement("a");
  anchorElement.setAttribute("download", `${fileName}.${fileExtension}`);
  anchorElement.setAttribute("href", url);
  anchorElement.click();
}

function updateCanvasHistory(details?: string) {
  if (
    props.historyMaxLength === 0 ||
    canvasElement.value === null ||
    canvasContext.value === null
  ) {
    return false;
  }

  if (
    canvasHistory.length !== 0 &&
    canvasHistoryIndex.value !== canvasHistory.length - 1
  ) {
    canvasHistory.splice(canvasHistoryIndex.value);
  }

  if (canvasHistory.length === props.historyMaxLength) {
    canvasHistory.shift();
  }

  const { width, height } = canvasElement.value;
  canvasHistory.push({
    details: details || props.canvasTool || "unknown",
    imageData: canvasContext.value.getImageData(0, 0, width, height),
    timestamp: Date.now(),
  });
  canvasHistoryIndex.value = canvasHistory.length - 1;

  return true;
}

function restoreCanvasFromHistory(index: number) {
  if (
    index < 0 ||
    index > canvasHistory.length - 1 ||
    canvasElement.value === null ||
    canvasContext.value === null
  ) {
    return false;
  }

  const { imageData } = canvasHistory[index];
  const { width, height } = canvasElement.value;
  canvasContext.value.clearRect(0, 0, width, height);
  canvasContext.value.putImageData(imageData, 0, 0);
  canvasHistoryIndex.value = index;

  return true;
}

function handleInteraction(e: PointerEvent, interactionStep: InteractionStep) {
  if (
    wrapperElement.value === null ||
    canvasElement.value === null ||
    canvasContext.value === null ||
    props.canvasTool === undefined
  ) {
    return;
  }

  const { width, height } = canvasElement.value;
  const {
    left,
    width: scaledWidth,
    top,
    height: scaledHeight,
  } = canvasElement.value.getBoundingClientRect();
  const x = (e.clientX - left) * (width / scaledWidth);
  const y = (e.clientY - top) * (height / scaledHeight);
  pointerHistory.push({ x, y, timestamp: Date.now() });

  const interactionData: CanvasInteractionData = {
    x,
    y,
    pointerHistory,
    wrapperElement: wrapperElement.value,
    canvasElement: canvasElement.value,
    canvasContext: canvasContext.value,
  };

  switch (interactionStep) {
    case InteractionStep.Start:
      emits("base-canvas:interaction-start");
      props.canvasTool.handleInteractionStart?.(e, interactionData);
    case InteractionStep.Ongoing:
      props.canvasTool.handleInteraction?.(e, interactionData);

      break;
    case InteractionStep.End:
      emits("base-canvas:interaction-end");
      props.canvasTool.handleInteractionEnd?.(e, interactionData);
      pointerHistory.length = 0;

      if (!props.canvasTool.doNotUpdateHistory) {
        updateCanvasHistory();
      }

      break;
  }
}

function handlePointerEnterEvent(e: PointerEvent) {
  if (pointerId.value !== null) {
    return;
  }

  pointerId.value = e.pointerId;
  pointerIsOver.value = true;
  pointerType.value =
    (e.pointerType as (typeof pointerType)["value"]) || "unknown";
}

function handlePointerMoveEvent(e: PointerEvent) {
  if (pointerIsActive.value === false || pointerId.value !== e.pointerId) {
    return;
  }

  handleInteraction(e, InteractionStep.Ongoing);
}

function handlePointerLeaveEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerId.value = null;
  pointerType.value = "unknown";
  pointerIsOver.value = false;
}

function handlePointerDownEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = true;
  handleInteraction(e, InteractionStep.Start);
}

function handlePointerUpEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = false;
  handleInteraction(e, InteractionStep.End);
}

watch(
  computed(() => props.canvasTool),
  (newCanvasTool, previousCanvasTool) => {
    if (
      wrapperElement.value === null ||
      canvasElement.value === null ||
      canvasContext.value === null
    ) {
      return;
    }

    const selectionData = {
      wrapperElement: wrapperElement.value,
      canvasElement: canvasElement.value,
      canvasContext: canvasContext.value,
    };

    emits("base-canvas:tool-select", newCanvasTool);
    newCanvasTool?.handleSelection?.(selectionData);

    emits("base-canvas:tool-deselect", previousCanvasTool);
    previousCanvasTool?.handleDeselection?.(selectionData);
  }
);

onMounted(() => {
  if (canvasElement.value === null) {
    throw new Error("unable_to_mount_canvas_element");
  }

  canvasContext.value = canvasElement.value.getContext("2d", {
    willReadFrequently: true,
  });
  window.addEventListener("pointerup", handlePointerUpEvent);
  updateCanvasHistory("open");
});

onUnmounted(() => {
  window.removeEventListener("pointerup", handlePointerUpEvent);
});

defineExpose<BaseCanvas>({
  wrapperElement,
  canvasElement,
  canvasContext,
  canvasHistory,
  canvasHistoryIndex,
  clearCanvas,
  zoomCanvas,
  saveCanvasAsImage,
  restoreCanvasFromHistory,
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
@use "@_sass/wtk.scss";

.base-canvas {
  place-items: center;
  display: grid;
  overflow: auto;
  border: wtk.get("border");

  canvas {
    border: wtk.get("border");
    touch-action: none;
  }
}
</style>
