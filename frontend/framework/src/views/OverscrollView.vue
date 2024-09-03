<script setup lang="ts">
import { ref } from "vue";

const showOverlay = ref(false);
</script>

<template>
  <main class="grid-content-layout padding-main gap-y-md">
    <h1>Overscroll behavior test area</h1>
    <BaseButton @click="showOverlay = !showOverlay">Toggle Overlay</BaseButton>
    <section
      id="overlay-section"
      class="grid-center-center"
      v-if="showOverlay"
    >
      <div class="box overflow-y width-sm height-sm">
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolor magnam, suscipit consequuntur tenetur veniam maxime nulla, provident, quidem nemo laudantium omnis voluptatibus praesentium voluptates aliquam. Sed delectus nihil possimus amet laborum reiciendis cum quod repellendus iusto dignissimos modi, molestiae, consequatur minus quam mollitia atque tempore neque vel cupiditate eaque dolor odio optio esse! Similique accusantium voluptatem, sed recusandae, repellat expedita earum ex possimus debitis omnis, sunt molestiae esse aperiam ut amet voluptates enim magnam necessitatibus sequi fugit repudiandae quas! Autem ut accusantium molestiae ipsam mollitia repudiandae quidem eaque quos possimus distinctio, perspiciatis alias nemo qui, dolore culpa nam veritatis reprehenderit laboriosam officiis repellendus? Placeat vero delectus adipisci suscipit numquam? Consequatur ducimus obcaecati aliquam at voluptate quo quaerat, quam veniam odio perferendis exercitationem nemo officia eligendi possimus minus nobis. Reiciendis deleniti nesciunt ratione in libero quibusdam. Incidunt, accusantium maxime, at laudantium atque eos architecto nemo perspiciatis labore distinctio deleniti nobis totam cupiditate cum odio. Porro esse excepturi aut corrupti autem! Voluptatibus tenetur unde est blanditiis corrupti praesentium error soluta saepe! Ratione quae blanditiis harum sint enim ipsam beatae! In esse explicabo asperiores eum tempora sed culpa deleniti ut aliquid error ipsam quas voluptatum, repudiandae quibusdam, dolorum maiores nulla alias. Tempora, nisi.
        </p>
        <BaseButton @click="showOverlay = false">Close Overlay</BaseButton>
      </div>
    </section>
  </main>
  <div class="height-xl"></div>
</template>

<style lang="scss">
#overscroll-main {
  height: 200vh;
}

#overlay-section {
  position: fixed;
  inset: 0;
  overscroll-behavior: contain;
}
</style>
