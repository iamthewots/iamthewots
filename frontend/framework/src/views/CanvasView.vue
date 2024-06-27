<script setup lang="ts">
import type { BaseCanvas, CanvasTool } from "@_vue/components/BaseCanvas.vue";
import BaseDrawer from "@_vue/components/BaseDrawer.vue";
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
  <main class="position-relative padding-main">
    <header class="flex-center-center margin-bottom-sm gap-md">
      <BaseButton
        @click="canvasApp?.saveCanvasAsImage('myBeautifulPicture', 'jpg')"
        >Save</BaseButton
      >
      <BaseDrawer closeOnClickOutside>
        <template #activator="drawer">
          <BaseButton @click="drawer.open">Toolset</BaseButton>
        </template>
        <template #default>
          <section class="box spread-y-xs width-sm height-screen">
            <h3>Tool settings</h3>
            <div>{{ selectedCanvasTool }}</div>
            <h3>Toolset</h3>
            <div
              :class="{
                'padding-xs': true,
                'border-left': true,
                'border-color-accent-1 text-color-accent-1':
                  selectedCanvasTool?.name === toolObject.name,
              }"
              @click="selectedCanvasTool = toolObject"
              v-for="(toolObject, toolName) in canvasTools"
              :key="toolName"
            >
              <span>{{ toolName }}</span>
            </div>
          </section>
        </template>
      </BaseDrawer>
      <BaseDrawer closeOnClickOutside>
        <template #activator="drawer">
          <BaseButton @click="drawer.open">History</BaseButton>
        </template>
        <template #default>
          <section class="box spread-y-xs width-sm height-screen">
            <h3>History position</h3>
            <div>{{ canvasApp?.canvasHistoryIndex }}</div>
            <h3>History</h3>
            <div
              :class="{
                'padding-xs': true,
                'border-left': true,
                'border-color-accent-1 text-color-accent-1':
                  canvasApp?.canvasHistoryIndex === index,
              }"
              @click="canvasApp?.restoreCanvasFromHistory(index)"
              v-for="(historyPoint, index) in canvasApp?.canvasHistory"
              :key="historyPoint.timestamp"
            >
              <b class="text-transform-uppercase">{{
                typeof historyPoint.details === "string"
                  ? historyPoint.details
                  : historyPoint.details.name
              }}</b>
              <br />
              <span class="font-size-sm">{{
                new Date(historyPoint.timestamp)
              }}</span>
            </div>
          </section>
        </template>
      </BaseDrawer>
      <BaseButton @click="canvasApp?.undo()">Undo</BaseButton>
      <BaseButton @click="canvasApp?.redo()">Redo</BaseButton>
    </header>
    <BaseCanvas
      width="1280"
      height="720"
      :canvasTool="selectedCanvasTool"
      ref="canvasApp"
    ></BaseCanvas>
  </main>
</template>

<style lang="scss"></style>
