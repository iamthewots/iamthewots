<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type PropType,
  type Ref,
} from "vue";

const COUNTER_METHODS_VALUES = ["auto", "manual"] as const;

type CounterMethod = (typeof COUNTER_METHODS_VALUES)[number];

export interface BaseCounterSlotProps {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
}

export interface BaseCounter {
  counter: Ref<number>;
  counterGoal: ComputedRef<number>;
  startCounter: () => void;
  stopCounter: () => void;
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
  decimals: {
    type: Number,
    default: 0,
    validator: (value: number) => value > 0,
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
  countsPerSecond: {
    type: Number,
    default: 30,
    validator: (value: number) => value > 0,
  },
  counterMethod: {
    type: String as PropType<CounterMethod>,
    default: "auto",
    validator: (value: CounterMethod) =>
      COUNTER_METHODS_VALUES.indexOf(value) !== -1,
  },
});

const emits = defineEmits({
  "base-counter:counter-start": (counter: number) => true,
  "base-counter:counter-stop": (counter: number) => true,
  "base-counter:counter-end": (counter: number) => true,
});

const counter = ref(props.countFrom);
const counterGoal = computed(() => props.value);
let counterIntervalId: number;

function updateCounter(countBy: number) {
  if (countBy === 0) {
    return;
  }

  counter.value += countBy;

  if (
    (countBy < 0 && counter.value <= counterGoal.value) ||
    (countBy > 0 && counter.value >= counterGoal.value)
  ) {
    window.clearInterval(counterIntervalId);
    counter.value = counterGoal.value;
    emits("base-counter:counter-end", counter.value);
  }
}

function startCounter() {
  if (counter.value === counterGoal.value) {
    return;
  }

  if (counterIntervalId !== undefined) {
    stopCounter();
  }

  const counterGap = counterGoal.value - counter.value;
  let countBy = Math.sign(counterGap);

  if (props.countBy !== undefined) {
    countBy *= props.countBy;
  } else {
    countBy *= Math.abs(counterGap) / (props.countIn / props.countsPerSecond);
  }

  emits("base-counter:counter-start", counter.value);
  counterIntervalId = window.setInterval(() => {
    updateCounter(countBy);
  }, 1000 / props.countsPerSecond);
}

function stopCounter() {
  if (counterIntervalId !== undefined) {
    emits("base-counter:counter-stop", counter.value);
  }

  window.clearInterval(counterIntervalId);
}

watch(counterGoal, () => {
  if (props.counterMethod === "auto") {
    startCounter();
  }
});

onMounted(() => {
  if (props.counterMethod === "auto") {
    startCounter();
  }
});

onBeforeUnmount(() => stopCounter());

const slotProps = { counter, counterGoal };
defineExpose({ counter, counterGoal, startCounter, stopCounter });
</script>

<template>
  <span class="base-counter" v-bind="$attrs">
    <slot v-bind="slotProps">{{ counter.toFixed(decimals) }}</slot>
  </span>
</template>
