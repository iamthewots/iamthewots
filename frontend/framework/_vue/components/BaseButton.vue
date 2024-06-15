<script setup lang="ts"></script>

<template>
  <button class="base-button" @touchstart=""><slot></slot></button>
</template>

<style lang="scss">
@use "@_sass/modules/fx.scss";
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-button {
  @include fx.set-box-shadow("button");
  @include theme.set-color-scheme("button");

  align-items: center;
  justify-content: center;
  transition: all wtk.get("duration", "xs") ease;
  display: inline-flex;
  outline: none;
  border: wtk.get("border");
  border-radius: wtk.get("border", "radius");
  padding-inline: wtk.get("spacing", "sm");
  gap: wtk.get("spacing", "sm");
  height: wtk.get("height", "input");
  font-family: wtk.get("font-family", "input");
  font-size: wtk.get("font-size", "md");
  cursor: pointer;

  &:disabled {
    opacity: 0.25;
  }

  &:active {
    box-shadow: none;
    scale: 0.975;
    translate: 0 0.2rem;;
  }
}
</style>
