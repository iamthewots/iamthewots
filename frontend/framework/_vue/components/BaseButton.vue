<script setup lang="ts">
import { computed } from "vue";

export interface BaseButtonProps {
  baseClassName?: string;
}

defineOptions({
  name: "BaseButton",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseButtonProps>(), {
  baseClassName: "base-button--default",
});
const buttonElementClassList = computed(() => {
  return {
    [props.baseClassName]: true,
  };
});
</script>

<template>
  <button :class="buttonElementClassList" v-bind="$attrs"><slot></slot></button>
</template>

<style lang="scss">
@use "@_sass/modules/fx.scss";
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-button {
  align-items: center;
  justify-content: center;
  display: inline-flex;
  outline: none;
  font-family: wtk.get("font-family", "input");
  font-size: wtk.get("font-size", "md");
}

.base-button--default {
  @include fx.set-box-shadow("button");
  @include theme.set-color-scheme("button");

  transition: all wtk.get("duration", 100ms);
  border: wtk.get("border");
  border-radius: wtk.get("border", "radius");
  padding-inline: wtk.get("spacing", "sm");
  height: wtk.get("height", "input");

  &:active {
    box-shadow: none;
    translate: 0 0.15rem;
  }
}
</style>
