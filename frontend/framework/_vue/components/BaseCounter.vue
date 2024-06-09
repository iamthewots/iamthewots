<script setup lang="ts">
import {
  useClassTools,
  type ClassSwitchers,
} from "@_vue/composables/use-class-tools";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface BaseCounterProps {
  value: number;
  counterStart?: number;
  counterSpeed?: number;
  counterDuration?: number;
  counterMethod?: CounterMethod;
  fixedDecimals?: number;
  classSwitchers?: ClassSwitchers<BaseCounterClassSwitchersData>;
}

export interface BaseCounterEmits {
  (e: "base-counter:counter-start", counter: number): void;
  (e: "base-counter:counter-stop", counter: number): void;
  (e: "base-counter:counter-end", counter: number): void;
}

export interface BaseCounterSlot {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}

export interface BaseCounter {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}

type CounterMethod = (typeof counterMethods)[number];

export interface BaseCounterClassSwitchersData {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}

defineOptions({
  name: "BaseCounter",
  inheritAttrs: false,
});

const counterMethods = ["manual", "auto", "resume"] as const;
const props = withDefaults(defineProps<BaseCounterProps>(), {
  counterStart: 0,
  duration: 1000,
  decimals: 0,
  method: "auto",
});
const emits = defineEmits<BaseCounterEmits>();
const counter = ref(props.counterStart);
const counterGoal = computed(() => props.value);
let counterIntervalId: number;
const { classLists } = useClassTools<BaseCounterClassSwitchersData>(
  {
    counter,
    counterGoal,
  },
  props.classSwitchers
);
const counterElementClassList = computed(() => {
  return {
    "base-counter": true,
    ...classLists.value.activeClassList,
  };
});

function startCounter() {
  if (counter.value === counterGoal.value) {
    return;
  } else if (counterIntervalId !== undefined) {
    stopCounter();
  }

  const counterSpeed = getCounterSpeed();
  emits("base-counter:counter-start", counter.value);
  counterIntervalId = window.setInterval(() => {
    updateCounter(counterSpeed);
  }, 1000 / 30);
}

function stopCounter() {
  if (counterIntervalId === undefined) {
    return;
  }

  window.clearInterval(counterIntervalId);
  emits("base-counter:counter-stop", counter.value);
}

function updateCounter(counterSpeed: number) {
  counter.value += counterSpeed;
  const goalReached =
    (counterSpeed < 0 && counter.value <= counterGoal.value) ||
    (counterSpeed > 0 && counter.value >= counterGoal.value);

  if (goalReached) {
    window.clearInterval(counterIntervalId);
    counter.value = counterGoal.value;
    emits("base-counter:counter-end", counter.value);
  }
}

function getCounterSpeed() {
  const counterGap = counterGoal.value - counter.value;
  let counterSpeed = Math.sign(counterGap);

  if (typeof props.counterSpeed === "number" && props.counterSpeed > 0) {
    return counterSpeed * props.counterSpeed;
  } else if (typeof props.duration === "number" && props.duration > 0) {
    return counterSpeed * (Math.abs(counterGap) / (props.duration / 30));
  }

  return counterSpeed;
}

watch(counterGoal, () => {
  if (props.method === "auto" || props.method === "resume") {
    startCounter();
  }
});

onMounted(() => {
  if (props.method === "auto") {
    startCounter();
  }
});

onBeforeUnmount(() => {
  stopCounter();
});

const slotProps: BaseCounterSlot = { counter, counterGoal };
defineExpose<BaseCounter>({ counter, counterGoal });
</script>

<template>
  <span :class="counterElementClassList" v-bind="$attrs">
    <slot v-bind="slotProps">{{ counter.toFixed(fixedDecimals) }}</slot>
  </span>
</template>
