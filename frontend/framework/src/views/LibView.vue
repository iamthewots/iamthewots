<script setup lang="ts">
import { StopWatch } from "@_lib/stop-watch";
import { TextTyper } from "@_lib/text-typer";
import { onMounted, ref, toRef } from "vue";

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
    .addPause(1000)
    .spellText("P-H-E-N-O-M-E-N-A-L!", "span", "phenomenal-entry");

  let refill = 2;

  textTyper.handleQueueEndEvent = () => {
    if (refill <= 0) {
      return;
    }

    textTyper
      .addLineBreak()
      .writeText("nigga...")
      .addLineBreak()
      .setCallback(() => console.log("Stole my bike?"))
      .writeText("WHAT CONSOLE SAID! He fucking stole my bike!")
      .start();
    refill--;
  };
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
</style>
