<script setup lang="ts">
import { useSplitAttrs } from "@_vue/composables/use-split-attrs";
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
  type Ref,
} from "vue";

export interface BaseNotepadProps {
  historyMaxLength?: number;
  notepadTool?: NotepadTool;
}

export interface BaseNotepadEmits {
  (e: "base-notepad:tool-select", notepadTool: NotepadTool): void;
  (e: "base-notepad:tool-deselect", notepadTool: NotepadTool): void;
  (e: "base-notepad:interaction-start"): void;
  (e: "base-notepad:interaction-end"): void;
}

export interface BaseNotepad {
  wrapperElement: Ref<HTMLElement | null>;
  canvasElement: Ref<HTMLCanvasElement | null>;
  canvasContext: Ref<CanvasRenderingContext2D | null>;
  canvasZoom: Ref<number>;
  canvasHistory: CanvasHistory;
  clear: () => void;
  zoom: (value: number) => void;
  exportAsImage: (fileName: string, fileExtension: string) => void;
  restoreCanvasHistoryPoint: (index: number) => boolean;
}

export interface NotepadTool {
  name: string;
  handleSelection?: InteractionHandler;
  handleDeselection?: InteractionHandler;
  handleInteractionStart?: InteractionHandler;
  handleInteraction?: InteractionHandler;
  handleInteractionEnd?: InteractionHandler;
}

enum InteractionType {
  "Start",
  "Active",
  "End",
}

type InteractionHandler = (e: PointerEvent, data: InteractionData) => void;

interface InteractionData {
  x: number;
  y: number;
  pointerHistory: PointerHistory;
  wrapperElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
}

type CanvasHistory = {
  imageData: ImageData;
  details: NotepadTool | string;
  timestamp: number;
}[];

type PointerHistory = {
  x: number;
  y: number;
  timestamp: number;
}[];

defineOptions({
  name: "BaseNotepad",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseNotepadProps>(), {
  historyMaxLength: 10,
});
const emits = defineEmits<BaseNotepadEmits>();
const wrapperElement = ref<HTMLElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const canvasZoom = ref(1);
const canvasHistory = reactive<CanvasHistory>([]);
const canvasHistoryIndex = ref(0);
const pointerId = ref<number | null>(null);
const pointerType = ref<"mouse" | "pen" | "touch" | "none">("none");
const pointerIsOver = ref(false);
const pointerIsActive = ref(false);
const pointerHistory = reactive<PointerHistory>([]);
const { nonStyleAttrs, styleAttrs } = useSplitAttrs();
const selectedTool = computed(() => props.notepadTool);

function clear() {}

function zoom(value: number) {
  if (canvasElement.value === null) {
    return;
  }

  value = Math.max(Math.min(value, 5), 0.1);
  canvasElement.value.style.scale = value.toString();
  canvasZoom.value = value;
}

function exportAsImage(fileName: string, fileExtension: string) {
  if (canvasElement.value === null) {
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
    return;
  }

  if (
    canvasHistory.length !== 0 &&
    canvasHistoryIndex.value !== canvasHistory.length - 1
  ) {
    canvasHistory.splice(canvasHistoryIndex.value);
  }

  const { width, height } = canvasElement.value;
  canvasHistory.push({
    details: details || props.notepadTool || "",
    imageData: canvasContext.value.getImageData(0, 0, width, height),
    timestamp: Date.now(),
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

  const { imageData } = canvasHistory[index];
  const { width, height } = canvasElement.value;
  canvasContext.value.clearRect(0, 0, width, height);
  canvasContext.value.putImageData(imageData, 0, 0);
  canvasHistoryIndex.value = index;

  return true;
}

function handleInteraction(e: PointerEvent, interaction: InteractionType) {
  if (
    wrapperElement.value === null ||
    canvasElement.value === null ||
    canvasContext.value === null ||
    props.notepadTool === undefined
  ) {
    return;
  }

  const { width, height } = canvasElement.value;
  const {
    left,
    width: scaleWidth,
    top,
    height: scaleHeight,
  } = canvasElement.value.getBoundingClientRect();
  const x = (e.clientX - left) * (width / scaleWidth);
  const y = (e.clientY - top) * (height / scaleHeight);
  pointerHistory.push({ x, y, timestamp: Date.now() });
  const data: InteractionData = {
    x,
    y,
    pointerHistory,
    wrapperElement: wrapperElement.value,
    canvasElement: canvasElement.value,
    canvasContext: canvasContext.value,
  };

  switch (interaction) {
    case InteractionType.Start:
      emits("base-notepad:interaction-start");
      props.notepadTool.handleInteractionStart?.(e, data);
      break;
    case InteractionType.Active:
      props.notepadTool.handleInteraction?.(e, data);
      break;
    case InteractionType.End:
      emits("base-notepad:interaction-end");
      props.notepadTool.handleInteractionEnd?.(e, data);
      updateCanvasHistory();
      break;
  }
}

function handlePointerEnterEvent(e: PointerEvent) {
  if (pointerId.value !== null) {
    return;
  }

  pointerId.value = e.pointerId;
  pointerIsOver.value = true;

  switch (e.pointerType) {
    case "mouse":
    case "pen":
    case "touch":
      pointerType.value = e.pointerType;

      break;
    default:
      pointerType.value = "mouse";
  }
}

function handlePointerMoveEvent(e: PointerEvent) {
  if (pointerIsActive.value === false || pointerId.value !== e.pointerId) {
    return;
  }

  handleInteraction(e, InteractionType.Active);
}

function handlePointerLeaveEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerId.value = e.pointerId;
  pointerType.value = "none";
  pointerIsOver.value = true;
}

function handlePointerDownEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = true;
  handleInteraction(e, InteractionType.Start);
}

function handlePointerUpEvent(e: PointerEvent) {
  if (pointerId.value !== e.pointerId) {
    return;
  }

  pointerIsActive.value = false;
  handleInteraction(e, InteractionType.End);
}

watch(selectedTool, (newTool, previousTool) => {
  // emit events
  // handle new tool selection
  // handle previous tool deselection
});

onMounted(() => {
  if (canvasElement.value === null) {
    throw new Error("canvas_element_not_mounted");
  }

  canvasContext.value = canvasElement.value.getContext("2d");
  window.addEventListener("pointerup", handlePointerUpEvent);
});

onUnmounted(() => {
  window.removeEventListener("pointerup", handlePointerUpEvent);
});

defineExpose<BaseNotepad>({
  wrapperElement,
  canvasElement,
  canvasContext,
  canvasHistory,
  canvasZoom,
  clear,
  zoom,
  exportAsImage,
  restoreCanvasHistoryPoint,
});
</script>

<template>
  <div class="base-notepad" v-bind="styleAttrs" ref="wrapperElement">
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
