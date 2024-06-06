<script setup lang="ts">
import { computed, ref } from "vue";

export interface BaseCardProps {
  turnOn?: "click" | "manual";
  turnDirection?:
    | "left"
    | "right"
    | "up"
    | "down"
    | "up-left"
    | "up-right"
    | "down-left"
    | "down-right";
}

export interface BaseCardEmits {
  (e: "base-card:turn-to-front"): void;
  (e: "base-card:turn-to-back"): void;
  (e: "base-card:turn-start", payload: CardFace): void;
  (e: "base-card:turn-end", payload: CardFace): void;
}

export interface BaseCard {
  turnFront: () => void;
  turnBack: () => void;
  turn: () => void;
}

type CardFace = "front" | "back";

const props = withDefaults(defineProps<BaseCardProps>(), {
  turnOn: "click",
  turnDirection: "right",
});
const emits = defineEmits<BaseCardEmits>();
const cardElement = ref<HTMLElement | null>(null);
const currentCardFace = ref<CardFace>("front");
let transitionIsActive = false;

const cardElementClassList = computed(() => {
  return {
    "base-card": true,
    [`base-card--turn-direction-${props.turnDirection}`]: true,
    "base-card--turn-back": currentCardFace.value === "back",
  };
});

function turnFront() {
  turn("front");
}

function turnBack() {
  turn("back");
}

function turn(cardFace?: CardFace) {
  if (cardFace === undefined) {
    cardFace = currentCardFace.value === "front" ? "back" : "front";
  }

  if (transitionIsActive || currentCardFace.value === cardFace) {
    return;
  }

  transitionIsActive = true;
  currentCardFace.value = cardFace;
  emits("base-card:turn-start", currentCardFace.value);
}

function handleClickEvent() {
  if (props.turnOn === "click") {
    turn();
  }
}

function handleTransitionEndEvent() {
  transitionIsActive = false;
  emits("base-card:turn-end", currentCardFace.value);

  if (currentCardFace.value === "front") {
    emits("base-card:turn-to-front");
  } else {
    emits("base-card:turn-to-back");
  }
}

const slotProps = { turnFront, turnBack, turn };
defineExpose({ turnFront, turnBack, turn });
</script>

<template>
  <div
    :class="cardElementClassList"
    @click="handleClickEvent"
    @transitionend="handleTransitionEndEvent"
    v-bind="$attrs"
    ref="cardElement"
  >
    <div class="base-card__content">
      <div class="base-card__face base-card__back-face">
        <slot name="backFace" v-bind="slotProps"></slot>
      </div>
      <div class="base-card__face base-card__front-face">
        <slot name="frontFace" v-bind="slotProps"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "@_sass/wtk.scss";

.base-card {
  --transition-duration: #{wtk.get("duration", "lg")};

  display: inline-block;
  perspective: 100rem;
  max-width: 100%;
  max-height: 100%;

  &__content {
    position: relative;
    transform-style: preserve-3d;
    transition: transform var(--transition-duration) ease;
    width: 100%;
    height: 100%;
  }

  &__face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    width: 100%;
    height: 100%;
  }
}

$card-rotations: (
  "left": rotateY(-180deg),
  "right": rotateY(180deg),
  "up": rotateX(180deg),
  "down": rotateX(-180deg),
  "up-left": rotate3d(1, 1, 0, 180deg),
  "up-right": rotate3d(1, 1, 0, -180deg),
  "down-left": rotate3d(1, 1, 0, -180deg),
  "down-right": rotate3d(-1, 1, 0, -180deg),
);

.base-card {
  &--turn-back &__content,
  &__back-face {
    transform: var(--transform);
  }
}

@each $direction, $transform in $card-rotations {
  .base-card--turn-direction-#{$direction} {
    --transform: #{$transform};
  }
}
</style>
