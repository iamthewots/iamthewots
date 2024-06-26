<script setup lang="ts">
import type { BaseCanvas, CanvasTool } from "@_vue/components/BaseCanvas.vue";
import { useCanvasTools } from "@_vue/composables/use-canvas-tools";
import { computed, ref } from "vue";

const canvasApp = ref<BaseCanvas>();
const { createPenTool, createEraserTool, panTool } = useCanvasTools();
const selectedCanvasTool = ref<CanvasTool>();
const canvasTools: { [key: string]: CanvasTool } = {
  Pencil: createPenTool("pencil"),
  "Round Eraser": createEraserTool("round_eraser", { lineCap: "round" }),
  "Square Eraser": createEraserTool("square_eraser", { lineCap: "square" }),
  Pan: panTool,
};
</script>

<template>
  <main class="canvas-app">
    <section class="canvas-app__sidebar">
      <div class="grid | canvas-app__canvas-tools">
        <div
          :class="{
            border: true,
            'padding-xs': true,
            'width-sm': true,
            [`background-color-${
              selectedCanvasTool?.name === toolObject.name ? 'accent-2' : 'main'
            }`]: true,
          }"
          @click="selectedCanvasTool = toolObject"
          v-for="(toolObject, toolName) in canvasTools"
          :key="toolName"
        >
          {{ toolName }}
        </div>
      </div>
    </section>
    <BaseCanvas
      class="canvas-app__canvas"
      width="1280"
      height="720"
      :canvasTool="selectedCanvasTool"
      ref="canvasApp"
    ></BaseCanvas>
    <section class="width-sm | canvas-app__sidebar">
      <div>
        <p>
          <b>Zoom: </b><span>{{ (canvasApp?.canvasZoom || 1) * 100 }}%</span>
        </p>
        <div class="flex flex-wrap gap-sm">
          <BaseButton
            @click="canvasApp?.zoomCanvas(zoomValue)"
            v-for="zoomValue in [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]"
            :key="zoomValue"
            >{{ zoomValue * 100 }}%</BaseButton
          >
        </div>
      </div>
      <div
        :class="{
          border: true,
          'padding-xs': true,
          'width-sm': true,
          [`background-color-${
            canvasApp?.canvasHistoryIndex === index ? 'accent-1' : 'main'
          }`]: true,
        }"
        @click="canvasApp?.restoreCanvasFromHistory(index)"
        v-for="(historyPoint, index) in canvasApp?.canvasHistory"
        :key="historyPoint.timestamp"
      >
        <p class="text-transform-capitalize">
          {{
            typeof historyPoint.details === "string"
              ? historyPoint.details
              : historyPoint.details.name
          }}
        </p>
        <small>{{
          new Date(historyPoint.timestamp).toLocaleDateString()
        }}</small>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.canvas-app {
  grid-template-columns: auto minmax(0, 1fr) auto;
  display: grid;
}
</style>
