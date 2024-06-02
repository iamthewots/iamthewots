<script setup lang="ts">
import {
  useDialogTools,
  type DialogToolsEmits,
  type DialogToolsProps,
} from "@_vue/composables/use-dialog-tools";

export interface BaseModalProps extends DialogToolsProps {
  wrapperElementTransition?: string;
  contentElementTransition?: string;
}

export interface BaseModalEmits extends DialogToolsEmits<"base-dialog"> {}

defineOptions({
  name: "BaseModal",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BaseModalProps>(), {
  wrapperElementTransition: "base-modal__wrapper",
  contentElementTransition: "base-modal__content",
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
      :name="wrapperElementTransition"
      mode="out-in"
      @after-enter="handleAfterEnterFromWrapperElement"
      @after-leave="handleAfterLeaveFromWrapperElement"
    >
      <div
        class="base-modal__wrapper"
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
  &__wrapper,
  &__content {
    place-items: center;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    display: grid;
  }

  &__wrapper {
    position: fixed;
    inset: 0;
    z-index: wtk.get("z-index", "xl");
    padding: wtk.get("spacing", "click-gap");
    backdrop-filter: blur(4px);
    background-color: theme.get-color("overlay", $color-alpha: "overlay");

    &-enter-active {
      animation: fade-in wtk.get("duration", "md") ease-out;
    }

    &-leave-active {
      animation: fade-out wtk.get("duration", "md") ease-out;
    }
  }

  &__content {
    &,
    & > * {
      max-width: 100%;
      max-height: 100%;
    }

    &-enter-active {
      animation: slide-from-bottom wtk.get("duration", "md") ease-out,
        fade-in wtk.get("duration", "md") ease-out;
    }

    &-leave-active {
      animation: slide-from-bottom wtk.get("duration", "md") ease-out reverse,
        fade-out wtk.get("duration", "md") ease-out;
    }
  }
}
</style>
