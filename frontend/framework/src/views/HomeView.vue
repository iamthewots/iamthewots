<script setup lang="ts">
import { ref } from "vue";

const buttonLabels = [
  "Join now",
  "Register new account",
  "Subscribe to newsletter",
  "Find exotic porn",
  "Exit",
];
const fontSizes = ["xs", "sm", "md", "lg", "xl", "hero"];
const currentFontSizeInPx = ref("0");

window.addEventListener("resize", () => {
  const bodyComputedStyle = window.getComputedStyle(document.body);
  currentFontSizeInPx.value = bodyComputedStyle.fontSize;
});
</script>

<template>
  <main class="grid-content-layout padding-x-main gap-y-md">
    <header class="box grid-rabbit-layout centered-content gap-sm max-width-md">
      <img
        src="https://loremflickr.com/320/320/cat"
        alt=""
        class="aspect-ratio-square border-circle width-avatar"
      />
      <div>
        <p><i>Leonardo Scarfò</i></p>
        <p><b>Main developer</b></p>
      </div>
    </header>
    <div class="box grid-center-center">
      <h2 class="text-is-title">Hi, this is a test box.</h2>
      <div
        class="grid-staggered-layout gap-main layout-width-md max-width-main-content"
      >
        <div class="box" v-for="buttonLabel in buttonLabels" :key="buttonLabel">
          {{ buttonLabel }}
        </div>
      </div>
    </div>
    <div class="_extend-to-gutters box spread-y-md">
      <h2 class="text-is-title">Time to test these font sizes!</h2>
      <small>Current font size: {{ currentFontSizeInPx }}</small>
      <p
        :class="`box font-size-${fontSize} font-weight-bold`"
        v-for="fontSize in fontSizes"
        :key="fontSize"
      >
        This is a font sample. The size is set to "{{ fontSize }}", and looks
        just like this. W
      </p>
    </div>
  </main>
</template>
