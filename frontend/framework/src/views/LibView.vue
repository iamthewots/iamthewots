<script setup lang="ts">
import { StopWatch } from "@_lib/stop-watch";
import { ref, toRef } from "vue";

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
</script>

<template>
  <main class="centered-content">
    <div class="box" ref="logElement"></div>
  </main>
</template>
