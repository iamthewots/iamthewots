<script setup lang="ts">
import {
  useDialogTools,
  type DialogToolsEmits,
  type DialogToolsProps,
} from "@_vue/composables/use-dialog-tools";
import { computed, type Ref } from "vue";

export interface BaseDrawerProps extends DialogToolsProps {
  drawFrom?: "left" | "right" | "top" | "bottom";
  isFullscreen?: boolean;
  wrapperElementTransitionName?: string;
  contentElementTransitionName?: string;
}

export interface BaseDrawerEmits extends DialogToolsEmits<"base-drawer"> {}

export interface BaseDrawer {
  wrapperElement: Ref<HTMLElement | null>;
  contentElement: Ref<HTMLElement | null>;
  open: () => void;
  close: () => void;
}

defineOptions({
  name: "BaseDrawer",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseDrawerProps>(), {
  drawFrom: "left",
  wrapperElementTransitionName: "base-drawer",
  contentElementTransitionName: "base-drawer__content",
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
    "base-drawer": true,
    [`base-drawer--draw-from-${props.drawFrom}`]: true,
    "base-drawer--is-fullscreen": props.isFullscreen,
  };
});

const wrapperElementParsedTransitionName = computed(() => {
  return props.isFullscreen ? props.wrapperElementTransitionName : "";
});

const slotProps = { open, close };
defineExpose({ wrapperElement, contentElement, open, close });
</script>

<template>
  <slot name="activator" v-bind="slotProps"></slot>
  <Teleport to="body" :disabled="!isFullscreen">
    <Transition
      :name="wrapperElementParsedTransitionName"
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
          :name="contentElementTransitionName"
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
@use "sass:map";

.base-drawer {
  position: absolute;
  inset: 0;
  overscroll-behavior: contain;

  &--is-fullscreen {
    position: fixed;
    backdrop-filter: blur(4px);
    background-color: theme.get-color("overlay", $color-alpha: "overlay");
  }

  &,
  &__content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    display: grid;
  }

  &__content,
  &__content > * {
    max-width: 100%;
    max-height: 100%;
  }
}

$draw-from-settings: (
  "left": (
    "padding-property": "padding-right",
    "place-items": center start,
  ),
  "right": (
    "padding-property": "padding-left",
    "place-items": center end,
  ),
  "top": (
    "padding-property": "padding-bottom",
    "place-items": start center,
  ),
  "bottom": (
    "padding-property": "padding-top",
    "place-items": center end,
  ),
);

@each $coordinate, $settings in $draw-from-settings {
  .base-drawer--draw-from-#{$coordinate} {
    --content-animation-name: draw-from-#{$coordinate};

    place-items: map.get($settings, "place-items");
    #{map.get($settings, "padding-property")}: wtk.get("spacing", "click-gap");
  }
}

.base-drawer {
  --animation-duration: #{wtk.get("duration")};

  &-enter-active {
    animation: fade-in var(--animation-duration) ease-out;
  }

  &-leave-active {
    animation: fade-out var(--animation-duration) ease-out;
  }
}

.base-drawer__content {
  --animation-duration: #{wtk.get("duration")};

  &-enter-active {
    animation: var(--content-animation-name) var(--animation-duration) ease-out;
  }

  &-leave-active {
    animation: var(--content-animation-name) var(--animation-duration) ease-out
      reverse;
  }
}
</style>
