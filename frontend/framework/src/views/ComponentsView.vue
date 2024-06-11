<script setup lang="ts">
import type { BaseCounterClassSwitchers } from "@_vue/components/BaseCounter.vue";
import { type BaseHoverBox } from "@_vue/components/BaseHoverBox.vue";
import type { BaseInput } from "@_vue/components/BaseInput.vue";
import { type BaseTextArea } from "@_vue/components/BaseTextArea.vue";
import { reactive, ref } from "vue";

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
  baseInputComponent.value?.saveValue(`save${Math.random() * 100}`);
}

function testInputMethod() {
  baseInputComponent.value?.toggleVisibility();
}

function handleSaveInputValueEvent(e: Event) {
  console.log(e);
}

// counter

const counterTestValue = ref(200);
const counterClassSwitchers: BaseCounterClassSwitchers = {
  "counter-is-low": (data) => data.counter.value <= 250,
  "counter-is-mid": (data) => data.counter.value > 250,
  "counter-is-high": (data) => data.counter.value > 500,
  "counter-is-valid": (data) => data.counter.value === data.counterGoal.value,
};

// textarea

const baseTextAreaComponent = ref<BaseTextArea>();

// checkbox

const checkboxValues = reactive({
  a: false,
  b: false,
  c: false,
})
</script>

<template>
  <main id="components" class="grid-content-layout spread-y-md padding-main">
    <h3 class="text-is-title text-color-accent-1">Components test area</h3>
    <section>
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
    </section>

    <section>
      <BaseInput
        placeholder="Base input"
        enableVisibilityToggle
        storageId="homeViewInput"
        storageType="session"
        @base-input:save-input-value="handleSaveInputValueEvent"
        v-model="baseInputModelValue"
        ref="baseInputComponent"
      >
      </BaseInput>
      <div class="spread-x-sm">
        <p>{{ baseInputModelValue }}</p>
        <button @click="saveInputValue">Save input value</button>
        <button @click="testInputMethod">Test input method</button>
      </div>
    </section>

    <section>
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
    </section>

    <section class="box position-relative">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
        cupiditate molestias aut dolores enim odio tempora culpa eaque voluptas
        sapiente, consectetur obcaecati eligendi repellendus commodi,
        accusantium cumque ea corporis deleniti? Minus sequi laborum suscipit
        quo dolore amet reiciendis vero, tempora recusandae ullam atque, autem
        ipsa quas qui ex veniam eius, eos placeat ipsum cumque sit! Harum quasi
        non excepturi repellendus eius ipsum consequatur facilis ullam maiores
        illo esse molestias ducimus asperiores, animi est ut perspiciatis
        corporis facere sint repellat? Quo reiciendis et autem iste ut aut
        laudantium quod a delectus molestias debitis aliquam eveniet saepe ea
        adipisci tenetur, tempora earum nobis rem corporis corrupti voluptatem.
        Harum eaque illo beatae? Illo vero accusantium numquam ullam libero
        atque quae mollitia aut non eos. Beatae, at laborum exercitationem enim
        veritatis repudiandae eaque dicta ipsum perspiciatis, ut sapiente. Dolor
        accusamus quisquam iure ipsa sapiente tempora, nisi est magni in hic
        temporibus eligendi delectus recusandae voluptate, sunt et minima
        officiis ratione optio eaque. Quisquam, laboriosam? Aperiam, ullam
        voluptate asperiores, ab iusto optio itaque velit totam eius, sed
        reiciendis qui obcaecati. Aliquid, neque culpa amet numquam atque,
        dolore eius dicta, perferendis labore ratione odit tempore. Minima
        adipisci officia quae praesentium porro ea, id quia sapiente laborum!
      </p>
      <BaseDrawer closeOnClickOutside>
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
              iure, ab veritatis maxime ipsam doloribus suscipit saepe nesciunt.
              Voluptate quo sunt hic eos iusto pariatur unde impedit laudantium
              id ad tempora commodi asperiores expedita repudiandae voluptatem
              molestias deserunt distinctio rem, atque itaque? Omnis, quas? Hic
              ipsum eum delectus saepe sed ullam nostrum officiis? Delectus
              architecto dignissimos ad at quaerat unde eius maiores similique
              tempore nemo ullam sapiente, aut fugit ex laboriosam nisi.
              Necessitatibus beatae exercitationem molestiae pariatur, debitis
              rem corrupti at ex esse eligendi porro, quia nisi ratione vitae
              optio sunt quidem earum repudiandae vel officia ab, quisquam ad
              temporibus architecto. Laudantium ipsam ex, vitae itaque natus
              ducimus in reiciendis fuga, excepturi sapiente animi fugit
              pariatur deleniti sequi minus magni, autem praesentium rem
              suscipit unde quis. Rem at voluptate quibusdam velit neque hic
              vero excepturi consequuntur nisi voluptas, id cumque omnis aperiam
              ducimus itaque dicta, suscipit vitae, placeat cupiditate. Expedita
              vero eaque asperiores, unde, libero, porro quia architecto nihil
              eius praesentium modi aperiam soluta quo accusamus odit magnam
              voluptate explicabo rem nobis sed provident minus ad repellendus!
              Quod voluptate voluptates nulla natus quam iure earum. Quasi a
              consectetur consequatur enim eligendi tenetur consequuntur
              debitis, tempore ipsam porro et eaque amet deleniti quo cum.
              Pariatur mollitia quasi suscipit iusto quam optio odit blanditiis.
              Mollitia, eligendi fugit doloribus ducimus ex exercitationem
              neque, similique laudantium perferendis dolorem magnam dolores,
              molestias deserunt assumenda porro rerum! Ex recusandae blanditiis
              placeat doloremque suscipit harum explicabo qui quasi facere
              dolorem accusamus pariatur veniam similique dicta enim quos
              consequuntur tempora quibusdam, beatae iste nostrum ea rem ipsum!
              Adipisci nobis ipsam, temporibus eum, quisquam, fugiat quas eos et
              aliquid nemo nesciunt labore molestias? Animi quae nihil debitis
              hic exercitationem sed quaerat cum id libero. Impedit voluptatem
              laudantium soluta labore et quae?
            </p>
            <p class="padding-main text-color-accent-2">
              Hello my dearest friend, this was a drawer!
            </p>
          </div>
        </template>
      </BaseDrawer>
    </section>

    <section>
      <BaseCard class="aspect-ratio-gaming-card width-md" turnDirection="right">
        <template #front-face>
          <div class="box center-content fit">
            <span>Hi, I am in the front!</span>
          </div>
        </template>
        <template #back-face>
          <div class="box center-content fit">
            <span>Hi, I'm in the back!</span>
          </div>
        </template>
      </BaseCard>
    </section>

    <section>
      <code
        ><BaseCounter
          :value="counterTestValue"
          :counterStart="15"
          :counterDuration="1500"
          :classSwitchers="counterClassSwitchers"
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
    </section>

    <section>
      <BaseTextArea
        storageId="test-textarea"
        storageType="local"
        ref="baseTextAreaComponent"
      ></BaseTextArea>
      <div>
        <span v-for="n in 3" :key="n">
          <button @click="baseTextAreaComponent?.saveValue(`save${n}`)">
            {{ `save${n}` }}
          </button>
          <button @click="baseTextAreaComponent?.restoreValue(`save${n}`)">
            {{ `restore${n}` }}
          </button>
        </span>
      </div>
    </section>

    <section>
      <div class="grid gap-y-sm">
        <p>{{ checkboxValues }}</p>
        <BaseCheckbox v-model="checkboxValues.a">Share anonymous data</BaseCheckbox>
        <BaseCheckbox v-model="checkboxValues.b">Allow cat petting</BaseCheckbox>
        <BaseCheckbox v-model="checkboxValues.c">Bark on command</BaseCheckbox>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.hover-box-test-item {
  $duration: 1000ms;

  .base-hover-box--active & {
    animation: hover-box-test-item-active $duration ease-out forwards;
  }

  .base-hover-box--inactive & {
    animation: hover-box-test-item-inactive $duration ease-out forwards;
  }
}

@keyframes hover-box-test-item-active {
  from {
    translate: 0 0;
  }
  to {
    translate: calc(var(--pointer-0-x) * var(--hover-box-x-multiplier))
      calc(var(--pointer-0-y) * var(--hover-box-y-multiplier));
  }
}

@keyframes hover-box-test-item-inactive {
  from {
    translate: calc(var(--pointer-0-x) * var(--hover-box-x-multiplier))
      calc(var(--pointer-0-y) * var(--hover-box-y-multiplier));
  }
  to {
    translate: 0 0;
  }
}

.counter-is {
  &-low {
    color: red;
  }

  &-mid {
    color: green;
  }

  &-high {
    font-weight: bold;
  }

  &-valid {
    font-style: italic;
  }
}
</style>
