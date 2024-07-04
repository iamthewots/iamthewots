<script setup lang="ts">
import { PointerSwipeGesture } from "@_lib/pointer-gesture";
import { StopWatch } from "@_lib/stop-watch";
import { TextTyper } from "@_lib/text-typer";
import { onMounted, ref } from "vue";

const logElement = ref<HTMLElement>();
const stopWatch = new StopWatch();
stopWatch.setCallback(2000, () => {
  logElement.value!.innerText += "\n 2 seconds passed, wait a bit more...";
});
stopWatch.setCallback(5000, () => {
  logElement.value!.innerText += "\n 5 seconds passed, almost done...";
});
stopWatch.setCallback(12000, () => {
  logElement.value!.innerText += "\n 12 seconds passed, something is wrong...";
});
stopWatch.setCallback(20000, () => {
  logElement.value!.innerText += "\n 20 seconds passed, loading complete!";
  stopWatch.stop();
  console.log(stopWatch.eventsLog);
});
console.log("ready to start stopwatch...");
stopWatch.start();

const textTyperElement = ref<HTMLElement>();
let textTyper: TextTyper;

onMounted(() => {
  textTyper = new TextTyper(textTyperElement.value!, 50);
  textTyper.punctuationTimeoutMultiplier = 10;
  textTyper.deleteTimeoutMultiplier = 0.25;
  textTyper
    .writeText("Today we launch a new component, the ")
    .writeText("#TextTyper", "span", "twitter-tag")
    .writeText(". ")
    .addPause(1000)
    .addLineBreak()
    .writeText(
      "Let us know what you think, we already have one word to describe it:"
    )
    .addLineBreak()
    .changeTimeout(150)
    .addPause(3000)
    .spellText("P-H-E-N-O-M-E-N-A-L!", "span", "phenomenal-entry")
    .changeTimeout(50);

  let refill = 2;

  textTyper.handleQueueEndEvent = () => {
    if (refill <= 0) {
      textTyper.clear();

      window.setTimeout(() => {
        textTyper.restore("myBike");
      }, 3000);

      return;
    }

    textTyper
      .addLineBreak()
      .writeText("nigga...")
      .addLineBreak()
      .setCallback(() => console.log("Stole my bike?"))
      .writeText("WHAT CONSOLE SAID! He fucking stole my bike!")
      .setCheckpoint("myBike")
      .start();
    refill--;
  };
});

// gesture
const gestureElement = ref<HTMLElement | null>(null);
const ballElement = ref<HTMLElement | null>(null);

function handleSwipeEvent(e: Event) {
  if (ballElement.value === null) {
    return;
  }

  console.log(e.type);

  let className = "";

  ballElement.value.classList.remove(
    "ball-is-left",
    "ball-is-right",
    "ball-is-up",
    "ball-is-down"
  );

  switch (e.type) {
    case "swipe-left":
      className = "ball-is-left";
      break;
    case "swipe-right":
      className = "ball-is-right";
      break;
    case "swipe-up":
      className = "ball-is-up";
      break;
    case "swipe-down":
      className = "ball-is-down";
      break;
  }

  console.log(className);
  ballElement.value.classList.add(className);
}

onMounted(() => {
  if (gestureElement.value === null) {
    return;
  }

  const swipeGesture = new PointerSwipeGesture(gestureElement.value, {
    pointersRequired: 1,
    threshold: 200,
    timeout: 1000,
  });
});
</script>

<template>
  <main
    class="center-content centered-content spread-y-md max-width-main-content padding-main"
  >
    <div class="box aspect-ratio-square max-width-md" ref="logElement"></div>
    <div
      class="box aspect-ratio-square max-width-md"
      ref="textTyperElement"
    ></div>
    <div class="flex-center-center gap-sm">
      <BaseButton @click="textTyper.start()">Start TextTyper</BaseButton>
      <BaseButton @click="textTyper.stop()">Stop TextTyper</BaseButton>
      <BaseButton @click="textTyper.skip()">Skip TextTyper</BaseButton>
      <BaseButton @click="textTyper.clear()">Clear TextTyper</BaseButton>
      <BaseButton @click="textTyper.restore('myBike')"
        >Restore TextTyper</BaseButton
      >
    </div>
    <div
      class="box aspect-ratio-square max-width-md | gesture-element"
      @swipe-left="handleSwipeEvent"
      @swipe-right="handleSwipeEvent"
      @swipe-up="handleSwipeEvent"
      @swipe-down="handleSwipeEvent"
      ref="gestureElement"
    >
      <div class="ball" ref="ballElement"></div>
    </div>
  </main>
</template>

<style lang="scss">
.twitter-tag {
  color: hsl(187, 93%, 51%);
  font-weight: bold;
}

.phenomenal-entry {
  display: inline-block;
  animation: slide-from-bottom 1600ms ease-out forwards,
    fade-in 1300ms ease-out forwards;
  color: red;
  font-weight: bold;
}

.gesture-element {
  position: relative;
  place-items: center;
  display: grid;
  touch-action: none;
}

.ball {
  position: absolute;
  transition: translate 200ms ease;
  aspect-ratio: 1;
  border-radius: 100rem;
  width: 4rem;
  background-color: red;

  &-is-left {
    translate: -100% 0;
  }

  &-is-right {
    translate: 100% 0;
  }

  &-is-up {
    translate: 0 -100%;
  }

  &-is-down {
    translate: 0 100%;
  }
}
</style>
