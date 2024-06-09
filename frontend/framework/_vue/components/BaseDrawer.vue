<script setup lang="ts">
import {
  useDialogTools,
  type DialogTools,
  type DialogToolsEmits,
} from "@_vue/composables/use-dialog-tools";
import { computed } from "vue";

export interface BaseDrawerProps {
  closeOnClickOutside?: boolean;
  drawFrom?: DrawDirection;
  isFullscreen?: boolean;
  wrapperElementTransitionName?: string;
  contentElementTransitionName?: string;
}

export interface BaseDrawerEmits extends DialogToolsEmits<"base-drawer:"> {}

export interface BaseDrawerSlot {
  open: DialogTools["open"];
  close: DialogTools["close"];
}

export interface BaseDrawer {
  wrapperElement: DialogTools["wrapperElement"];
  contentElement: DialogTools["contentElement"];
  open: DialogTools["open"];
  close: DialogTools["close"];
}

type DrawDirection = (typeof drawDirections)[number];

defineOptions({
  name: "BaseDrawer",
  inheritAttrs: false,
});

const drawDirections = ["left", "right", "top", "bottom"] as const;
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
  handleAfterEnterEventFromWrapperElement,
  handleAfterEnterEventFromContentElement,
  close,
  handleAfterLeaveEventFromContentElement,
  handleAfterLeaveEventFromWrapperElement,
} = useDialogTools({
  closeOnClickOutside: !!props.closeOnClickOutside,
  emits,
  emitsPrefix: "base-drawer:",
});
const wrapperElementClassList = computed(() => {
  return {
    "base-drawer": true,
    "base-drawer--fullscreen": props.isFullscreen,
    [`base-drawer--draw-from-${props.drawFrom}`]: true,
  };
});
const parsedWrapperElementTransitionName = computed(() => {
  return props.isFullscreen ? props.wrapperElementTransitionName : "";
});

const slotProps: BaseDrawerSlot = { open, close };
defineExpose<BaseDrawer>({ wrapperElement, contentElement, open, close });
</script>

<template>
  <slot name="activator" v-bind="slotProps"></slot>
  <Teleport to="body" :disabled="isFullscreen">
    <Transition
      :name="parsedWrapperElementTransitionName"
      @after-enter="handleAfterEnterEventFromWrapperElement"
      @after-leave="handleAfterLeaveEventFromWrapperElement"
    >
      <div
        :class="wrapperElementClassList"
        v-bind="$attrs"
        v-if="showWrapperElement"
        ref="wrapperElement"
      >
        <Transition
          :name="contentElementTransitionName"
          @after-enter="handleAfterEnterEventFromContentElement"
          @after-leave="handleAfterLeaveEventFromContentElement"
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

  &--fullscreen {
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
  $padding-property: map.get($settings, "padding-property");
  $padding: wtk.get("spacing", "click-gap");

  .base-drawer--draw-from-#{$coordinate} {
    --base-drawer-content-animation-name: draw-from-#{$coordinate};

    place-items: map.get($settings, "place-items");
    #{$padding-property}: $padding;
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
    animation: var(--base-drawer-content-animation-name)
      var(--animation-duration) ease-out;
  }

  &-leave-active {
    animation: var(--base-drawer-content-animation-name)
      var(--animation-duration) ease-out reverse;
  }
}
</style>
