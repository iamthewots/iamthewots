<script setup lang="ts">
import {
  useDialogTools,
  type DialogToolsEmits,
  type DialogToolsProps,
} from "@_vue/composables/use-dialog-tools";
import type { Ref } from "vue";

export interface BaseModalProps extends DialogToolsProps {
  wrapperElementTransitionName?: string;
  contentElementTransitionName?: string;
}

export interface BaseModalEmits extends DialogToolsEmits<"base-dialog"> {}

export interface BaseModal {
  wrapperElement: Ref<HTMLElement | null>;
  contentElement: Ref<HTMLElement | null>;
  open: () => void;
  close: () => void;
}

defineOptions({
  name: "BaseModal",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseModalProps>(), {
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
  close,
  handleAfterEnterFromWrapperElement,
  handleAfterEnterFromContentElement,
  handleAfterLeaveFromContentElement,
  handleAfterLeaveFromWrapperElement,
} = useDialogTools({
  closeOnClickOutside: props.closeOnClickOutside,
  emits,
  emitsEventPrefix: "base-modal:",
});

const slotProps = { open, close };
defineExpose({ wrapperElement, contentElement, open, close });
</script>

<template>
  <slot name="activator" v-bind="slotProps"></slot>
  <Teleport to="body">
    <Transition
      :name="wrapperElementTransitionName"
      mode="out-in"
      @after-enter="handleAfterEnterFromWrapperElement"
      @after-leave="handleAfterLeaveFromWrapperElement"
    >
      <div
        class="base-modal"
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
