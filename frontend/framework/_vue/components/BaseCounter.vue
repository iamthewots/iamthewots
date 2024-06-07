<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
  type ComponentObjectPropsOptions,
} from "vue";

export interface BaseCounterProps {
  value: number;
  countFrom?: number;
  countBy?: number;
  countIn?: number;
  updatesPerSecond?: number;
  fixedDecimals?: number;
}

export interface BaseCounterEmits {
  (e: "base-counter:counter-start", currentValue: number): void;
  (e: "base-counter:counter-stop", currentValue: number): void;
  (e: "base-counter:counter-end", currentValue: number): void;
}

defineOptions({
  name: "BaseCounter",
  inheritAttrs: false,
});

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  countFrom: {
    type: Number,
    default: 0,
  },
  countBy: {
    type: Number,
    validator: (value: number) => value > 0,
  },
  countIn: {
    type: Number,
    default: 1000,
    validator: (value: number) => value > 0,
  },
  updatesPerSecond: {
    type: Number,
    default: 30,
    validator: (value: number) => value >= 1 && value < 120,
  },
  fixedDecimals: {
    type: Number,
    default: 0,
    validator: (value: number) => value > 0,
  },
});
const emits = defineEmits<BaseCounterEmits>();
const counter = ref(props.countFrom);
const counterGoal = computed(() => props.value);
let counterIntervalId: number;

function startCounter() {
  if (counter.value === counterGoal.value) {
    return;
  } else if (counterIntervalId !== undefined) {
    stopCounter();
  }

  const counterGap = counterGoal.value - counter.value;
  let counterStep = Math.sign(counterGap);

  if (props.countBy !== undefined) {
    counterStep *= props.countBy;
  } else {
    counterStep *=
      Math.abs(counterGap) / (props.countIn / props.updatesPerSecond);
  }

  emits("base-counter:counter-start", counter.value);
  counterIntervalId = window.setInterval(() => {
    updateCounter(counterStep);
  }, 1000 / props.updatesPerSecond);
}

function stopCounter() {
  window.clearInterval(counterIntervalId);
  emits("base-counter:counter-stop", counter.value);
}

function updateCounter(counterStep: number) {
  counter.value += counterStep;
  const counterGoalReached =
    (counterStep < 0 && counter.value <= counterGoal.value) ||
    (counterStep > 0 && counter.value >= counterGoal.value);

  if (counterGoalReached) {
    window.clearInterval(counterIntervalId);
    counter.value = counterGoal.value;
    emits("base-counter:counter-end", counter.value);
  }
}

watch(counterGoal, () => startCounter());
onMounted(() => startCounter());

const slotProps = { counter, counterGoal };
defineExpose({ counter, counterGoal, stopCounter, startCounter });
</script>

<template>
  <span class="base-counter" v-bind="$attrs">
    <slot v-bind="slotProps">{{ counter.toFixed(fixedDecimals) }}</slot>
  </span>
</template>
