<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface BaseCounterProps {
  countTo: number;
  countFrom?: number;
  duration?: number;
  decimals?: number;
  updatesPerSecond?: number;
}

export interface BaseCounterEmits {
  (e: "base-counter:counter-start", payload: number): void;
  (e: "base-counter:counter-end", payload: number): void;
}

export interface BaseCounter {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}

const props = withDefaults(defineProps<BaseCounterProps>(), {
  countFrom: 0,
  duration: 1000,
  decimals: 0,
  updatesPerSecond: 30,
});
const emits = defineEmits<BaseCounterEmits>();
const counter = ref(props.countFrom);
const counterGoal = computed(() => props.countTo);
let counterIntervalId: number;

function startCounter() {
  if (counter.value === counterGoal.value) {
    return;
  }

  window.clearInterval(counterIntervalId);
  emits("base-counter:counter-start", counter.value);
  const goalDelta = counterGoal.value - counter.value;
  const delta =
    Math.sign(goalDelta) *
    (Math.abs(goalDelta) / (props.duration / props.updatesPerSecond));

  console.log(delta);
  counterIntervalId = window.setInterval(() => {
    counter.value += delta;

    if (
      (delta < 0 && counter.value <= counterGoal.value) ||
      (delta > 0 && counter.value >= counterGoal.value)
    ) {
      window.clearInterval(counterIntervalId);
      counter.value = counterGoal.value;
      emits("base-counter:counter-end", counter.value);
    }
  }, 1000 / props.updatesPerSecond);
}

watch(counterGoal, () => startCounter());

onMounted(() => startCounter());

const slotProps = { counter, counterGoal };
defineExpose({ counter, counterGoal });
</script>

<template>
  <span class="base-counter"
    ><slot>{{ counter.toFixed(decimals) }}</slot></span
  >
</template>
