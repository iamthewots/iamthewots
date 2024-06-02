<script setup lang="ts">
import {
  useDialogTools,
  type DialogToolsEmits,
  type DialogToolsProps,
} from "@_vue/composables/use-dialog-tools";
import { computed } from "vue";

export interface BaseDrawerProps extends DialogToolsProps {
  drawFrom?: "left" | "right" | "top" | "bottom";
  isFullscreen?: boolean;
  wrapperElementTransition?: string;
  contentElementTransition?: string;
}

export interface BaseDrawerEmits extends DialogToolsEmits<"base-drawer"> {}

defineOptions({
  name: "BaseDrawer",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseDrawerProps>(), {
  drawFrom: "left",
  wrapperElementTransition: "base-drawer__wrapper",
  contentElementTransition: "base-drawer__content",
});
const emits = defineEmits<BaseDrawerEmits>();
const {
  wrapperElement,
  contentElement,
  showWrapperElement,
  showContentElement,
  open,
  close,
  handleAfterEnterFromWrapperElement,
  handleAfterEnterFromContentElement,
  handleAfterLeaveFromContentElement,
  handleAfterLeaveFromWrapperElement,
} = useDialogTools({
  closeOnClickOutside: props.closeOnClickOutside,
  emits,
  emitsEventPrefix: "base-drawer:",
});

const wrapperElementClassList = computed(() => {
  return {
    "base-drawer__wrapper": true,
    [`base-drawer__wrapper--${props.drawFrom}`]: true,
    [`base-drawer__wrapper--is-fullscreen`]: props.isFullscreen,
  };
});

const slotProps = { open, close };
defineExpose({ wrapperElement, contentElement, open, close });
</script>

<template>
  <slot name="activator" v-bind="slotProps"></slot>
  <Teleport to="body" :disabled="!isFullscreen">
    <Transition
      :name="wrapperElementTransition"
      mode="out-in"
      @after-enter="handleAfterEnterFromWrapperElement"
      @after-leave="handleAfterLeaveFromWrapperElement"
    >
      <div
        :class="wrapperElementClassList"
        v-bind="$attrs"
        v-if="showWrapperElement"
        ref="wrapperElement"
      >
        <Transition
          :name="contentElementTransition"
          mode="out-in"
          @after-enter="handleAfterEnterFromContentElement"
          @after-leave="handleAfterLeaveFromContentElement"
        >
          <div
            class="base-drawer__content"
            v-if="showContentElement"
            ref="contentElement"
          >
            <slot v-bind="slotProps"></slot>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
@use "@_sass/modules/theme.scss";
@use "@_sass/wtk.scss";

.base-drawer {
  &__wrapper,
  &__content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    display: grid;
  }

  &__wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;

    &--is-fullscreen {
      backdrop-filter: blur(4px);
      background-color: theme.get-color("overlay", $color-alpha: "overlay");
    }

    @each $coordinate in "left", "right", "top", "bottom" {
      &--#{$coordinate} {
        --content-animation-name: draw-from-#{$coordinate};

        $padding: wtk.get("spacing", "click-gap");

        @if ($coordinate == "left") {
          place-items: center start;
          padding-right: $padding;
        } @else if ($coordinate == "right") {
          place-items: center end;
          padding-left: $padding;
        } @else if ($coordinate == "top") {
          place-items: start center;
          padding-bottom: $padding;
        } @else {
          place-items: end center;
          padding-top: $padding;
        }
      }
    }
  }

  &__content {
    &,
    & > * {
      max-width: 100%;
      max-height: 100%;
    }

    &-enter-active {
      animation: var(--content-animation-name) wtk.get("duration", "md")
        ease-out;
    }

    &-leave-active {
      animation: var(--content-animation-name) wtk.get("duration", "md")
        ease-out reverse;
    }
  }
}
</style>
