<script setup lang="ts">
import type { ClassToggles } from "@_vue/composables/use-class-tools";
import {
  computed,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface BaseCounterProps {
  value: number;
  startValue?: number;
  counterStep?: number;
  counterSpeed?: number;
  counterFPS?: number;
  classToggles?: BaseCounterClassToggles;
  fixedDecimals?: number;
}

export type BaseCounterClassToggles = ClassToggles<{
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}>;

export interface BaseCounterEmits {
  (e: "base-counter:counter-start", payload: number): void;
  (e: "base-counter:counter-stop", payload: number): void;
  (e: "base-counter:counter-end", payload: number): void;
}

export interface BaseCounter {}

const props = withDefaults(defineProps<BaseCounterProps>({
  counterStep: {}
}), {
  startValue: 0,
  counterStep: 0,
  counterSpeed: 1000,
  counterFPS: 30,
  fixedDecimals: 0,
});
const emits = defineEmits<BaseCounterEmits>();
const counter = ref(props.startValue);
const counterGoal = computed(() => props.value);
let counterIntervalId: number | undefined;

function startCounter() {
  if (counter.value === counterGoal.value) {
    return;
  }

  if (counterIntervalId !== undefined) {
    stopCounter();
  }

  const counterFps = getCounterFps();
  const counterStep = getCounterStep(counterFps);

  emits("base-counter:counter-start", counter.value);
  counterIntervalId = window.setInterval(() => {
    updateCounter(counterStep);
  }, 1000 / counterFps);
}

function stopCounter() {
  window.clearInterval(counterIntervalId);
  emits("base-counter:counter-stop", counter.value);
}

function updateCounter(counterStep: number) {}

function getCounterFps() {
  return typeof props.counterFPS === "number" && props.counterFPS > 0
    ? getCounterFps
    : 30;
}

function getCounterStep(counterFps: number) {}

watch(counterGoal, () => startCounter());
onMounted(() => startCounter());

const slotProps = { counter, counterGoal };
defineExpose({ counter, counterGoal, startCounter, stopCounter });
</script>

<template>
  <span class="wrapperElementClassList"
    ><slot v-bind="slotProps">{{ counter.toFixed(fixedDecimals) }}</slot></span
  >
</template>
