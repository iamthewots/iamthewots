<script setup lang="ts">
import type { BaseCanvas, CanvasTool } from "@_vue/components/BaseCanvas.vue";
import { useCanvasTools } from "@_vue/composables/use-canvas-tools";
import { computed, ref } from "vue";

const baseCanvasComponent = ref<BaseCanvas>();
const { createPenTool, createEraserTool, panTool } = useCanvasTools();
const selectedTool = computed(() => {
  return canvasToolSet[selectedToolName.value];
});
const selectedToolName = ref<string>("");
const canvasToolSet: { [key: string]: CanvasTool } = {
  Pencil: createPenTool("pencil"),
  "Round Eraser": createEraserTool("round_eraser", { lineCap: "round" }),
  "Square Eraser": createEraserTool("round_eraser", { lineCap: "square" }),
  Pan: panTool,
};

function adjustZoomToFit() {
  if (baseCanvasComponent.value === undefined) {
    return;
  }

  const { wrapperElement, canvasElement } = baseCanvasComponent.value;

  if (wrapperElement.value === null || canvasElement.value === null) {
    return;
  }

  console.log("e alora")
  const { width: wrapperWidth, height: wrapperHeight } =
    wrapperElement.value.getBoundingClientRect();
  const { width: canvasWidth, height: canvasHeight } = canvasElement.value;
  const scaleX = wrapperWidth / canvasWidth;
  const scaleY = wrapperHeight / canvasHeight;
  baseCanvasComponent.value.zoomCanvas(Math.min(scaleX, scaleY));
}
</script>

<template>
  <main class="padding-main">
    <div class="canvas-ui">
      <div class="canvas-ui__toolset">
        <BaseRadio
          v-for="(_canvasTool, toolName) in canvasToolSet"
          v-model="selectedToolName"
          :value="toolName"
          :key="toolName"
          >{{ toolName }}</BaseRadio
        >
        <div class="box width-xs font-size-xs">
          <code>{{ selectedTool }}</code>
        </div>
      </div>
      <BaseCanvas
        width="1280"
        height="720"
        :canvasTool="selectedTool"
        ref="baseCanvasComponent"
      ></BaseCanvas>
      <div class="spread-y-xs | canvas-ui__history">
        <p>{{ baseCanvasComponent?.canvasHistoryIndex }}</p>
        <div
          :class="`box width-sm ${
            baseCanvasComponent?.canvasHistoryIndex.value === index
              ? 'background-color-accent-1'
              : ''
          }`"
          @click="baseCanvasComponent?.restoreCanvasFromHistory(index)"
          v-for="(historyPoint, index) in baseCanvasComponent?.canvasHistory"
          :key="historyPoint.timestamp"
        >
          <b>({{ index }}) Action: </b>
          <span>{{
            typeof historyPoint.details === "object"
              ? historyPoint.details.name
              : historyPoint.details
          }}</span>
          <p>{{ new Date(historyPoint.timestamp).toLocaleString() }}</p>
        </div>
      </div>
      <div class="canvas-ui__zoom-bar">
        <BaseButton @click="adjustZoomToFit">Fit</BaseButton>
        <BaseButton
          @click="baseCanvasComponent?.zoomCanvas(value)"
          v-for="value in [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]"
          :key="value"
          >{{ value * 100 }}%</BaseButton
        >
      </div>
    </div>
  </main>
</template>

<style lang="scss">
@use "@_sass/wtk.scss";

.canvas-ui {
  grid-template-areas: "toolset canvas history" "zoom zoom zoom";
  grid-template-columns: auto minmax(0, 1fr) auto;
  display: grid;
  gap: wtk.get("spacing", "sm");

  &__toolset {
    grid-area: toolset;
    flex-direction: column;
    display: flex;
    gap: wtk.get("spacing", "xs");
  }

  .base-canvas {
    overflow: scroll;
    grid-area: canvas;
  }

  &__history {
    grid-area: history;
  }

  &__zoom-bar {
    grid-area: zoom;
    justify-content: center;
    flex-wrap: wrap;
    display: flex;
    gap: wtk.get("spacing", "xs");
  }
}
</style>
