<script setup lang="ts">
import {
  useDialogTools,
  type DialogTools,
  type DialogToolsEmits,
  type DialogToolsProps,
} from "@_vue/composables/use-dialog-tools";

export interface BaseModalProps {
  closeOnClickOutside?: DialogToolsProps["closeOnClickOutside"];
  drawFrom?: DrawDirection;
  fullscreen?: boolean;
  wrapperElementTransitionName?: string;
  contentElementTransitionName?: string;
}

export interface BaseModalEmits extends DialogToolsEmits<"base-modal:"> {}

export interface BaseModalSlot {
  open: DialogTools["open"];
  close: DialogTools["close"];
}

export interface BaseModal {
  wrapperElement: DialogTools["wrapperElement"];
  contentElement: DialogTools["contentElement"];
  open: DialogTools["open"];
  close: DialogTools["close"];
}

type DrawDirection = (typeof drawDirections)[number];

defineOptions({
  name: "BaseModal",
  inheritAttrs: false,
});

const drawDirections = ["left", "right", "top", "bottom"] as const;
const props = withDefaults(defineProps<BaseModalProps>(), {
  drawFrom: "left",
  wrapperElementTransitionName: "base-modal",
  contentElementTransitionName: "base-modal__content",
});
const emits = defineEmits<BaseModalEmits>();
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
  closeOnClickOutside: props.closeOnClickOutside,
  emits,
  emitsPrefix: "base-modal:",
});

const slotProps: BaseModalSlot = { open, close };
defineExpose<BaseModal>({ wrapperElement, contentElement, open, close });
</script>

<template>
  <slot name="activator" v-bind="slotProps"></slot>
  <Teleport to="body">
    <Transition
      :name="wrapperElementTransitionName"
      @after-enter="handleAfterEnterEventFromWrapperElement"
      @after-leave="handleAfterLeaveEventFromWrapperElement"
    >
      <div
        class="base-modal"
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
            class="base-modal__content"
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

.base-modal {
  position: fixed;
  inset: 0;
  z-index: wtk.get("z-index", "xl");
  overscroll-behavior: contain;
  padding: wtk.get("spacing", "click-gap");
  backdrop-filter: blur(4px);
  background-color: theme.get-color("overlay", $color-alpha: "overlay");

  &,
  &__content {
    place-items: center;
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

.base-modal {
  --animation-duration: #{wtk.get("duration")};

  &-enter-active {
    animation: fade-in var(--animation-duration) ease-out;
  }

  &-leave-active {
    animation: fade-out var(--animation-duration) ease-out;
  }
}

.base-modal__content {
  --animation-duration: #{wtk.get("duration")};

  &-enter-active {
    animation: slide-from-bottom var(--animation-duration) ease-out,
      fade-in var(--animation-duration) ease-out;
  }

  &-leave-active {
    animation: slide-from-bottom var(--animation-duration) ease-out reverse,
      fade-out var(--animation-duration) ease-out;
  }
}
</style>
