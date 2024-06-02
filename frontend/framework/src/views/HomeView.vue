<script setup lang="ts">
import { type BaseHoverBox } from "@_vue/components/BaseHoverBox.vue";
import type { BaseInput } from "@_vue/components/BaseInput.vue";
import { ref } from "vue";

// font-size
const fontSizes = "xs,sm,md,lg,xl,hero".split(",");
const currentFontSizeInPx = ref("");

window.addEventListener("resize", () => {
  const bodyComputedStyle = window.getComputedStyle(document.body);
  currentFontSizeInPx.value = bodyComputedStyle.fontSize;
});

// hover-box
const baseHoverBoxComponent = ref<BaseHoverBox>();

function logHoverBoxData() {
  if (baseHoverBoxComponent.value) {
    const hoverBoxData = baseHoverBoxComponent.value.getHoverBoxData();
    console.log(hoverBoxData);
  }
}

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    logHoverBoxData();
  }
});

// input

const baseInputComponent = ref<BaseInput>();
const baseInputModelValue = ref("");

function testInputMethod() {
  baseInputComponent.value?.saveInputValue("test");
}

function handleSaveInputValueEvent(e: Event) {
  console.log(e);
}
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
      class="_extend-to-gutters grid-content-layout layout-main-width-text-box gap-y-md"
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
      class="centered-content grid-sandwich-layout box-shadow-groovy background-color-main"
    >
      <h3 class="padding-sm text-color-accent-2">grid-sandwich-layout</h3>
      <img src="https://loremflickr.com/300/240/sexy,asian" alt="" />
      <div class="padding-sm">
        <p>by Leonardo Scarfò</p>
        <i>semi-responsive, fixed-layout, single-column</i>
      </div>
    </div>

    <section id="highlight" class="box">
      <div class="border-rounded padding-main highlight">
        <h3 class="text-color-accent-2">Highlight engine</h3>
        <div class="border-rounded padding-main highlight">
          <p>made by Leonardo Scarfò</p>
          <div class="border-rounded padding-main highlight">
            <i>responsive, 3 levels deep</i>
          </div>
        </div>
      </div>
    </section>

    <section id="components" class="box position-relative spread-y-md">
      <h3 class="text-is-title text-color-accent-1">Components test area</h3>
      <BaseHoverBox
        class="box center-content centered-content aspect-ratio-square max-width-md"
        ref="baseHoverBoxComponent"
      >
        <div
          class="aspect-ratio-square width-xs background-color-accent-1 text-align-center | hover-box-test-item"
        >
          Effect
        </div>
      </BaseHoverBox>

      <div>
        <BaseInput
          placeholder="Base input"
          storageId="homeViewInput"
          @base-input:save-input-value="handleSaveInputValueEvent"
          v-model="baseInputModelValue"
          ref="baseInputComponent"
        ></BaseInput>
        <p>{{ baseInputModelValue }}</p>
        <button @click="testInputMethod">Test input method</button>
      </div>

      <div>
        <BaseModal closeOnClickOutside>
          <template #activator="modal">
            <button @click="modal.open">Open modal</button>
            <button @click="modal.close">Close modal</button>
          </template>
          <template #default>
            <div class="box | modal-test-item">
              Hello my dearest friend, this is a modal.
            </div>
          </template>
        </BaseModal>

        <BaseDrawer closeOnClickOutside>
          <template #activator="drawer">
            <button @click="drawer.open">Open drawer</button>
          </template>
          <template #default>
            <div class="box fit-screen">Hello my dearest friend, I am a drawer!</div>
          </template>
        </BaseDrawer>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.hover-box-test-item {
  .base-hover-box--active & {
    transition: translate 250ms ease;
    translate: calc(var(--pointer-0-x) * var(--hover-box-x-multiplier) * -1)
      calc(var(--pointer-0-y) * var(--hover-box-y-multiplier) * -1);
  }

  .base-hover-box--inactive & {
    transition: translate 1000ms ease-out;
    translate: 0 0;
  }
}
</style>
