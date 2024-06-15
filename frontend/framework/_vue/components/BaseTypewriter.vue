<script setup lang="ts">
import { ref } from "vue";

export interface BaseTypewriterProps {
  typewriterSpeed?: number;
  pauseOnPunctuation?: boolean;
}

export interface BaseTypewriterEmits {
  (e: "update:modelValue", text: string): void;
  (e: "base-typewriter:start", text: string): void;
  (e: "base-typewriter:pause", text: string): void;
  (e: "base-typewriter:resume", text: string): void;
  (e: "base-typewriter:end", text: string): void;
  (e: "base-typewriter:action-start", actionId: ActionId): void;
  (e: "base-typewriter:action-end", actionId: ActionId): void;
}

export interface BaseTypewriter {
  writeHTML: (html: string, sanitize?: boolean) => void;
  writeText: (text: string, wrapperElement?: Element) => void;
  wait: (timeout: number) => void;
  deleteText: (charsCount: number) => void;
  deleteAll: () => void;
  skip: () => void;
  skipAll: () => void;
  pause: (gracefully?: boolean) => void;
  resume: (delay?: number) => void;
  setSpeed: (speed: number, isMultiplier?: boolean) => void;
}

type ActionId =
  | "writeHTML"
  | "writeText"
  | "wait"
  | "deleteText"
  | "deleteAll"
  | "skip"
  | "skipAll";

interface CacheEntry {
  node: Node;
  originalTextContent: string;
}

const props = defineProps();
const emits = defineEmits();
const typewriterElement = ref<HTMLElement | null>(null);
const typewriterCache: CacheEntry[] = [];
const typewriterActionsQueue = [];

function writeHTML(html: string, sanitize?: boolean) {}

function writeText(text: string, wrapperElement?: Element) {}

function wait() {}

function deleteText(charsCount: number) {}

function deleteAll() {}

function skip() {}

function skipAll() {}

function pause(gracefully?: boolean) {}

function resume(delay?: number) {}

function setSpeed(speed: number, isMultiplier?: boolean) {}

defineExpose<BaseTypewriter>({
  writeHTML,
  writeText,
  wait,
  deleteText,
  deleteAll,
  skip,
  skipAll,
  pause,
  resume,
  setSpeed,
});
</script>

<template>
  <div class="base-typewriter" ref="typewriterElement"></div>
</template>

<style lang="scss"></style>
