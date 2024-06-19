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
  textTyper = new TextTyper(textTyperElement.value!, 25);
  textTyper
    .writeText("Ciao, come va?")
    .pauseText(1000)
    .writeText(" Mi sembri molto gay...")
    .pauseText(1000)
    .deleteText(6)
    .writeText("gagliardo!")
    .pauseText(2000)
    .deleteText(10)
    .changeTimeout(1000)
    .writeText("...")
    .changeTimeout(25)
    .pauseText(2000)
    .deleteText(3)
    .writeText(
      " finocchio ( o_o)",
      (() => {
        const el = document.createElement("span");
        el.classList.add("finocchio");

        return el;
      })()
    );
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
      <BaseButton @click="textTyper.startTyping()">Start TextTyper</BaseButton>
      <BaseButton @click="textTyper.stopTyping()">Stop TextTyper</BaseButton>
      <BaseButton @click="textTyper.skipTyping()">Skip TextTyper</BaseButton>
    </div>
  </main>
</template>

<style lang="scss">
.finocchio {
  color: pink;
  font-weight: bold;
}
</style>
