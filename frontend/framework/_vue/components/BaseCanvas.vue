<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

export interface BaseCanvasProps {
  toolSettings?: BaseCanvasToolSettings;
}

export interface BaseCanvasEmits {
  (e: "base-canvas:draw-start", toolSettings: BaseCanvasToolSettings): void;
  (e: "base-canvas:draw-end", toolSettings: BaseCanvasToolSettings): void;
  (e: "base-canvas:erase-start", toolSettings: BaseCanvasToolSettings): void;
  (e: "base-canvas:erase-end", toolSettings: BaseCanvasToolSettings): void;
}

export interface BaseCanvas {}

export interface BaseCanvasToolSettings {
  id: string;
  action: "draw" | "erase";
  lineWidth: CanvasPathDrawingStyles["lineWidth"];
  lineCap: CanvasPathDrawingStyles["lineCap"];
  lineJoin: CanvasPathDrawingStyles["lineJoin"];
  color: string;
}

interface MouseCoordinates {
  x: number;
  y: number;
}

defineOptions({
  name: "BaseCanvas",
  inheritAttrs: false,
});

const props = defineProps<BaseCanvasProps>();
const emits = defineEmits<BaseCanvasEmits>();
const canvasElement = ref<HTMLCanvasElement | null>(null);
const inputIsOver = ref(false);
const inputIsActive = ref(false);
let context: CanvasRenderingContext2D | null = null;
const wrapperElementClassList = computed(() => {
  return {
    "base-canvas": true,
    "base-canvas--input-is-over": inputIsOver.value,
    "base-canvas--input-is-active": inputIsActive.value,
  };
});

function handleInputInteraction(e: MouseEvent) {
  if (
    props.toolSettings === undefined ||
    context === null ||
    canvasElement.value === null
  ) {
    return;
  }

  const { left, top } = canvasElement.value.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;

  if (props.toolSettings.action === "draw") {
    draw(x, y);
  } else if (props.toolSettings.action === "erase") {
    erase(x, y);
  }
}

function handleInputInteractionEnd() {
  if (context === null) {
    return;
  }

  context.beginPath();
}

function draw(x: number, y: number) {
  if (context === null) {
    return;
  }

  // bezierCurveTo ?
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineTo(x, y);
  context.stroke();
}

function erase(x: number, y: number) {
  if (context === null || props.toolSettings === undefined) {
    return;
  }

  const { lineWidth } = props.toolSettings;
  context.clearRect(x, y, lineWidth, lineWidth);
}

function handleMouseEnterEvent(e: MouseEvent) {
  inputIsOver.value = true;
}

function handleMouseMoveEvent(e: MouseEvent) {
  if (inputIsActive.value === false || context === null) {
    return;
  }

  handleInputInteraction(e);
}

function handleMouseLeaveEvent() {
  inputIsOver.value = false;
  inputIsActive.value = false;
  handleInputInteractionEnd();
}

function handleMouseDownEvent() {
  inputIsActive.value = true;
}

function handleMouseUpEvent() {
  inputIsActive.value = false;
  handleInputInteractionEnd();
}

onMounted(() => {
  if (canvasElement.value === null) {
    return;
  }

  context = canvasElement.value.getContext("2d");
});
</script>

<template>
  <section :class="wrapperElementClassList">
    <canvas
      class="base-canvas"
      width="500"
      height="300"
      @mouseenter="handleMouseEnterEvent"
      @mousemove="handleMouseMoveEvent"
      @mouseleave="handleMouseLeaveEvent"
      @mousedown="handleMouseDownEvent"
      @mouseup="handleMouseUpEvent"
      v-bind="$attrs"
      ref="canvasElement"
    ></canvas>
    <div class="base-canvas__cursor">cazzoduro</div>
  </section>
</template>

<style lang="scss">
.base-canvas {
  position: relative;
  place-items: center;
  display: grid;

  canvas {
    cursor: crosshair;
  }

  &__cursor {
    position: absolute;
    display: none;
    width: var(--base-canvas-input-size);
    height: var(--base-canvas-input-size);

    .base-canvas--input-is-over & {
      display: block;
    }
  }
}
</style>
