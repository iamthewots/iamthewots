<script setup lang="ts">
import { trackPointerFromElement } from "@_lib/pointer-tracker";
import { onMounted, ref } from "vue";

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

export interface BaseCanvasToolSettings {}

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

function erase(e: MouseEvent) {}

function handleMouseEnterEvent(e: MouseEvent) {
  inputIsOver.value = true;
}

function handleMouseMoveEvent(e: MouseEvent) {
  if (inputIsActive.value === false || canvasElement.value === null) {
    return;
  }

  const { left, top } = canvasElement.value.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  draw(x, y);
}

function handleMouseLeaveEvent() {
  inputIsOver.value = false;
  inputIsActive.value = false;
  context?.beginPath();
}

function handleMouseDownEvent() {
  inputIsActive.value = true;
}

function handleMouseUpEvent() {
  inputIsActive.value = false;
  context?.beginPath();
}

onMounted(() => {
  if (canvasElement.value === null) {
    return;
  }

  context = canvasElement.value.getContext("2d");
});
</script>

<template>
  <canvas
    v-bind="$attrs"
    @mouseenter="handleMouseEnterEvent"
    @mousemove="handleMouseMoveEvent"
    @mouseleave="handleMouseLeaveEvent"
    @mousedown="handleMouseDownEvent"
    @mouseup="handleMouseUpEvent"
    ref="canvasElement"
  ></canvas>
</template>

<style lang="scss"></style>
