<script setup lang="ts">
import { computed, ref, type Ref } from "vue";

export interface BaseCardProps {
  turnMethod?: TurnMethod;
  turnDirection?: TurnDirection;
}

export interface BaseCardEmits {
  (e: "base-card:turn-start", from: CardFace): void;
  (e: "base-card:turn-end", to: CardFace): void;
  (e: "base-card:turn-front"): void;
  (e: "base-card:turn-back"): void;
}

type CardFace = "front" | "back";
type TurnMethod = (typeof turnMethods)[number];
type TurnDirection = (typeof turnDirections)[number];

defineOptions({
  name: "BaseCard",
  inheritAttrs: false,
});

const turnMethods = ["click", "manual"] as const;
const turnDirections = [
  "left",
  "right",
  "up",
  "down",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
] as const;

const props = withDefaults(defineProps<BaseCardProps>(), {
  turnMethod: "click",
  turnDirection: "right",
});
const emits = defineEmits<BaseCardEmits>();
const cardElement = ref<HTMLElement | null>(null);
const currentCardFace = ref<CardFace>("front");
let transitionIsActive = false;
const cardElementClassList = computed(() => {
  return {
    "base-card": true,
    "base-card--turn-back": currentCardFace.value === "back",
    [`base-card--turn-direction-${props.turnDirection}`]: true,
  };
});

function turn(cardFace?: CardFace) {
  if (cardFace === currentCardFace.value || transitionIsActive) {
    return;
  } else if (cardFace === undefined) {
    cardFace = currentCardFace.value === "front" ? "back" : "front";
  }

  emits("base-card:turn-start", currentCardFace.value);
  transitionIsActive = true;
  currentCardFace.value = cardFace;
}

function turnFront() {
  turn("front");
}

function turnBack() {
  turn("back");
}

function handleClickEvent() {
  if (props.turnMethod === "click") {
    turn();
  }
}

function handleTransitionEndEvent() {
  transitionIsActive = false;
  emits("base-card:turn-end", currentCardFace.value);

  if (currentCardFace.value === "front") {
    emits("base-card:turn-front");
  } else {
    emits("base-card:turn-back");
  }
}

export interface BaseCardSlot {
  turn: typeof turn;
  turnFront: typeof turnFront;
  turnBack: typeof turnBack;
}
const slotProps = { turn, turnFront, turnBack };

export interface BaseCard {
  cardElement: (typeof cardElement)["value"];
  turn: typeof turn;
  turnFront: typeof turnFront;
  turnBack: typeof turnBack;
}
defineExpose({ cardElement, turn, turnFront, turnBack });
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
        <slot name="back-face" v-bind="slotProps"></slot>
      </div>
      <div class="base-card__face base-card__front-face">
        <slot name="front-face" v-bind="slotProps"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "@_sass/wtk.scss";

.base-card {
  $transition-duration: #{wtk.get("duration", "lg")};

  display: inline-block;
  perspective: 100rem;
  max-width: 100%;
  max-height: 100%;

  &__content {
    position: relative;
    transform-style: preserve-3d;
    transition: transform var(--transition-duration, $transition-duration)
      ease-out;
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

$transform-map: (
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

  @each $direction, $transform in $transform-map {
    &--turn-direction-#{$direction} {
      --transform: #{$transform};
    }
  }
}
</style>
