<script setup lang="ts">
import { ref } from "vue";

// font-size
const fontSizes = "xs,sm,md,lg,xl,hero".split(",");
const currentFontSizeInPx = ref("");

window.addEventListener("resize", () => {
  const bodyComputedStyle = window.getComputedStyle(document.body);
  currentFontSizeInPx.value = bodyComputedStyle.fontSize;
});
</script>

<template>
  <main class="grid-content-layout padding-main gap-y-md">
    <section id="font-size" class="box grid gap-y-md">
      <header>
        <h2 class="text-is-title text-color-accent-1">Font sizes</h2>
        <p>Current HTML font size: {{ currentFontSizeInPx }}</p>
        <small>(font size updated on resize)</small>
      </header>
      <p
        :class="`font-size-${fontSize}`"
        v-for="fontSize in fontSizes"
        :key="fontSize"
      >
        <b class="margin-right-sm text-color-accent-2">({{ fontSize }})</b>
        <span
          >Lorem ipsum dolor sit, amet consectetur adipisicing elit. Modi
          incidunt corrupti rerum!</span
        >
      </p>
    </section>
    <div
      id="flex-rabbit-layout"
      class="box centered-content flex-rabbit-layout box-shadow-groovy gap-md"
    >
      <img
        class="border-circle aspect-ratio-square width-xs"
        src="https://loremflickr.com/500/500/cat"
        alt=""
      />
      <div>
        <h3 class="text-color-accent-2">flex-rabbit-layout</h3>
        <div>
          <p>by Leonardo Scarfò</p>
          <i>dual-column</i>
        </div>
      </div>
    </div>
    <div id="grid-staggered-layout" class="grid-staggered-layout gap-y-md">
      <div class="box box-shadow-groovy">
        <h3 class="text-color-accent-2">grid-staggered-layout</h3>
        <p>by Leonardo Scarfò</p>
        <i>Responsive, modular, dual-column</i>
      </div>
      <div class="box box-shadow-groovy" v-for="n in 4" :key="n">
        <p>grid-staggered-layout</p>
      </div>
    </div>
    <div
      id="grid-content-layout"
      class="_extend-to-full-width grid-content-layout gap-y-md"
    >
      <div class="box">
        <h3 class="text-color-accent-2">grid-content-layout</h3>
        <p>by Leonardo Scarfò</p>
        <i>Responsive, modular, signle-column</i>
      </div>
      <div class="_extend-to-full-width box">_extend-to-full-width</div>
      <div class="_extend-to-gutters box">_extend-to-gutters</div>
      <div class="_extend-to-left box">_extend-to-left</div>
      <div class="_extend-to-right box">_extend-to-right</div>
    </div>
    <div
      id="grid-sandwich-layout"
      class="box centered-content grid-sandwich-layout box-shadow-groovy gap-sm"
    >
      <h3 class="text-color-accent-2">grid-sandwich-layout</h3>
      <img src="https://loremflickr.com/300/300/dog" alt="" />
      <div>
        <p>by Leonardo Scarfò</p>
        <i>semi-responsive, fixed-layout, single-column</i>
      </div>
    </div>
  </main>
</template>
