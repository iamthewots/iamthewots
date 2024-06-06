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

function saveInputValue() {
  baseInputComponent.value?.saveInputValue(`save${Math.random() * 100}`);
}

function testInputMethod() {
  const saveData = baseInputComponent.value?.browserStorage?.export();

  if (saveData) {
    console.log(saveData);
  }
}

function handleSaveInputValueEvent(e: Event) {
  console.log(e);
}

// counter

const counterTestValue = ref(200);
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
        <div class="spread-x-sm">
          <p>{{ baseInputModelValue }}</p>
          <button @click="saveInputValue">Save input value</button>
          <button @click="testInputMethod">Test input method</button>
        </div>
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

        <BaseDrawer closeOnClickOutside isFullscreen>
          <template #activator="drawer">
            <button @click="drawer.open">Open drawer</button>
          </template>
          <template #default>
            <div
              class="box grid-sandwich-layout padding-0 width-md height-screen"
            >
              <p class="padding-main text-color-accent-1">
                Hello my dearest friend, this is a drawer!
              </p>
              <p class="padding-x-main overflow-y">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
                accusantium modi tempore consequatur nulla cumque eum maiores
                iure, ab veritatis maxime ipsam doloribus suscipit saepe
                nesciunt. Voluptate quo sunt hic eos iusto pariatur unde impedit
                laudantium id ad tempora commodi asperiores expedita repudiandae
                voluptatem molestias deserunt distinctio rem, atque itaque?
                Omnis, quas? Hic ipsum eum delectus saepe sed ullam nostrum
                officiis? Delectus architecto dignissimos ad at quaerat unde
                eius maiores similique tempore nemo ullam sapiente, aut fugit ex
                laboriosam nisi. Necessitatibus beatae exercitationem molestiae
                pariatur, debitis rem corrupti at ex esse eligendi porro, quia
                nisi ratione vitae optio sunt quidem earum repudiandae vel
                officia ab, quisquam ad temporibus architecto. Laudantium ipsam
                ex, vitae itaque natus ducimus in reiciendis fuga, excepturi
                sapiente animi fugit pariatur deleniti sequi minus magni, autem
                praesentium rem suscipit unde quis. Rem at voluptate quibusdam
                velit neque hic vero excepturi consequuntur nisi voluptas, id
                cumque omnis aperiam ducimus itaque dicta, suscipit vitae,
                placeat cupiditate. Expedita vero eaque asperiores, unde,
                libero, porro quia architecto nihil eius praesentium modi
                aperiam soluta quo accusamus odit magnam voluptate explicabo rem
                nobis sed provident minus ad repellendus! Quod voluptate
                voluptates nulla natus quam iure earum. Quasi a consectetur
                consequatur enim eligendi tenetur consequuntur debitis, tempore
                ipsam porro et eaque amet deleniti quo cum. Pariatur mollitia
                quasi suscipit iusto quam optio odit blanditiis. Mollitia,
                eligendi fugit doloribus ducimus ex exercitationem neque,
                similique laudantium perferendis dolorem magnam dolores,
                molestias deserunt assumenda porro rerum! Ex recusandae
                blanditiis placeat doloremque suscipit harum explicabo qui quasi
                facere dolorem accusamus pariatur veniam similique dicta enim
                quos consequuntur tempora quibusdam, beatae iste nostrum ea rem
                ipsum! Adipisci nobis ipsam, temporibus eum, quisquam, fugiat
                quas eos et aliquid nemo nesciunt labore molestias? Animi quae
                nihil debitis hic exercitationem sed quaerat cum id libero.
                Impedit voluptatem laudantium soluta labore et quae?
              </p>
              <p class="padding-main text-color-accent-2">
                Hello my dearest friend, this was a drawer!
              </p>
            </div>
          </template>
        </BaseDrawer>
      </div>
      <div>
        <BaseCard
          class="aspect-ratio-gaming-card width-md"
          turnDirection="up-left"
        >
          <template #frontFace>
            <div class="box center-content fit">
              <span>Hi, I am in the front!</span>
            </div>
          </template>
          <template #backFace>
            <div class="box center-content fit">
              <span>Hi, I'm in the back!</span>
            </div>
          </template>
        </BaseCard>
      </div>
      <div>
        <code
          ><BaseCounter
            :countTo="counterTestValue"
            :countFrom="15"
            :duration="4000"
          >
          </BaseCounter
        ></code>
        <p>
          <button @click="counterTestValue = 111">111</button>
          <button @click="counterTestValue = 222">222</button>
          <button @click="counterTestValue = 333">333</button>
          <button @click="counterTestValue = 444">444</button>
          <button @click="counterTestValue = 999.99">999.99</button>
        </p>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.hover-box-test-item {
  $duration: 500ms;

  .base-hover-box--active & {
    animation: hover-box-test-item-active $duration ease forwards;
  }

  .base-hover-box--inactive & {
    animation: hover-box-test-item-inactive $duration ease forwards;
  }
}

@keyframes hover-box-test-item-active {
  from {
    translate: 0 0;
  }
  to {
    translate: calc(var(--pointer-0-x) * var(--hover-box-x-multiplier) * -1)
      calc(var(--pointer-0-y) * var(--hover-box-y-multiplier) * -1);
  }
}

@keyframes hover-box-test-item-inactive {
  from {
    translate: calc(var(--pointer-0-x) * var(--hover-box-x-multiplier) * -1)
      calc(var(--pointer-0-y) * var(--hover-box-y-multiplier) * -1);
  }
  to {
    translate: 0 0;
  }
}
</style>
