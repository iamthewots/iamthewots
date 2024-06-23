<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";

export interface BaseCanvasProps {
  toolSettings?: BaseCanvasToolSettings;
}

export interface BaseCanvasEmits {
  (e: "base-canvas:interaction-start", toolAction: ToolAction): void;
  (e: "base-canvas:interaction-end", toolAction: ToolAction): void;
}

export interface BaseCanvas {
  canvasElement: Ref<HTMLCanvasElement | null>;
  clearCanvas: () => void;
  setBackgroundColor: (color: string) => void;
  exportAsImage: (fileName: string, fileExtension: "jpeg" | "png") => void;
}

enum ToolAction {
  "Draw",
  "Erase"
}

interface DrawTool {
  toolName: string;
  toolAction: ToolAction.Draw;
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineJoin: CanvasPathDrawingStyles["lineJoin"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  color: string | CanvasPattern | CanvasGradient;
}

interface EraseTool {
  toolName: string;
  toolAction: ToolAction.Erase;
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
}

export type BaseCanvasToolSettings = DrawTool | EraseTool;

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

  switch (props.toolSettings.toolAction) {
    case ToolAction.Draw:
      return draw(x, y);
    case ToolAction.Erase:
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
    props.toolSettings.toolAction !== ToolAction.Draw ||
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
    case "butt":
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

function clearCanvas() {
  if (context === null || canvasElement.value === null) {
    return;
  }

  context.clearRect(
    0,
    0,
    canvasElement.value.width,
    canvasElement.value.height
  );
}

function setBackgroundColor(color: string) {}

function exportAsImage(fileName: string, fileExtension: "jpeg" | "png") {
  if (canvasElement.value === null) {
    throw new Error("canvas_element_not_found");
  }

  const data = canvasElement.value.toDataURL(`image/${fileExtension}`);
  const url = data.replace(/^data:image\/png/, "data:application/octet-stream");
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", `${fileName}.${fileExtension}`);
  downloadLink.setAttribute("href", url);
  downloadLink.click();
}

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

defineExpose<BaseCanvas>({
  canvasElement,
  clearCanvas,
  setBackgroundColor,
  exportAsImage,
});
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
