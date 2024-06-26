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
  counterFPS?: number;
  fixedDecimals?: number;
  classSwitchers?: BaseCounterClassSwitchers;
}

export interface BaseCounterEmits {
  (e: "base-counter:counter-start", counter: number): void;
  (e: "base-counter:counter-stop", counter: number): void;
  (e: "base-counter:counter-end", counter: number): void;
}

type CounterMethod = (typeof counterMethods)[number];

export type BaseCounterClassSwitchers =
  ClassSwitchers<BaseCounterClassSwitchersData>;

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
  counterDuration: 1000,
  counterMethod: "auto",
  counterFPS: 30,
  fixedDecimals: 0,
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
  return ["base-counter", ...classLists.value.activeClassList];
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
  }, 1000 / props.counterFPS);
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
  } else if (
    typeof props.counterDuration === "number" &&
    props.counterDuration > 0
  ) {
    return (
      counterSpeed *
      (Math.abs(counterGap) / (props.counterDuration / props.counterFPS))
    );
  }

  return counterSpeed;
}

watch(counterGoal, () => {
  if (props.counterMethod === "auto" || props.counterMethod === "resume") {
    startCounter();
  }
});

onMounted(() => {
  if (props.counterMethod === "auto") {
    startCounter();
  }
});

onBeforeUnmount(() => {
  stopCounter();
});

export interface BaseCounterSlot {
  counter: (typeof counter)["value"];
  counterGoal: (typeof counterGoal)["value"];
}
const slotProps = { counter, counterGoal };

export interface BaseCounter {
  counter: (typeof counter)["value"];
  counterGoal: (typeof counterGoal)["value"];
}
defineExpose({ counter, counterGoal });
</script>

<template>
  <span :class="counterElementClassList" v-bind="$attrs">
    <slot v-bind="slotProps">{{ counter.toFixed(fixedDecimals) }}</slot>
  </span>
</template>
