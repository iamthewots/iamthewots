import type { VueEmits } from "@_vue/types";
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

export interface DialogToolsProps {
  closeOnClickOutside: boolean;
}

export interface DialogToolsEmits<P extends string> {
  (e: `${P}open-start`): void;
  (e: `${P}open-end`): void;
  (e: `${P}close-start`): void;
  (e: `${P}close-end`): void;
  (e: `${P}click-outside`): void;
}

export interface DialogToolsSettings {
  closeOnClickOutside: boolean;
  emits: VueEmits;
  emitsPrefix: string;
}

export interface DialogTools {
  wrapperElement: Ref<HTMLElement | null>;
  contentElement: Ref<HTMLElement | null>;
  showWrapperElement: Ref<boolean>;
  showContentElement: Ref<boolean>;
  open: () => void;
  handleAfterEnterEventFromWrapperElement: () => void;
  handleAfterEnterEventFromContentElement: () => void;
  close: () => void;
  handleAfterLeaveEventFromWrapperElement: () => void;
  handleAfterLeaveEventFromContentElement: () => void;
}

export function useDialogTools(settings: DialogToolsSettings): DialogTools {
  const wrapperElement = ref<HTMLElement | null>(null);
  const contentElement = ref<HTMLElement | null>(null);
  const showWrapperElement = ref(false);
  const showContentElement = ref(false);

  function open() {
    if (showWrapperElement.value) {
      return;
    }

    const { emits, emitsPrefix } = settings;
    showWrapperElement.value = true;
    emits(`${emitsPrefix}open-start`);
  }

  function handleAfterEnterEventFromWrapperElement() {
    showContentElement.value = true;
  }

  function handleAfterEnterEventFromContentElement() {
    const { emits, emitsPrefix } = settings;
    emits(`${emitsPrefix}open-end`);
  }

  function close() {
    if (showContentElement.value === false) {
      return;
    }

    const { emits, emitsPrefix } = settings;
    showContentElement.value = false;
    emits(`${emitsPrefix}close-start`);
  }

  function handleAfterLeaveEventFromContentElement() {
    showWrapperElement.value = false;
  }

  function handleAfterLeaveEventFromWrapperElement() {
    const { emits, emitsPrefix } = settings;
    emits(`${emitsPrefix}close-end`);
  }

  function handleClickEventFromWindow(e: Event) {
    const { emits, emitsPrefix, closeOnClickOutside } = settings;

    if (
      showWrapperElement.value === false ||
      wrapperElement.value === null ||
      contentElement.value === null ||
      e.target instanceof Element === false ||
      contentElement.value === e.target ||
      contentElement.value.contains(e.target)
    ) {
      return;
    }

    emits(`${emitsPrefix}click-outside`);

    if (closeOnClickOutside) {
      close();
    }
  }

  watch(contentElement, () => {
    console.log(`change: ${contentElement.value}`);
  });

  onMounted(() =>
    document.body.addEventListener("click", handleClickEventFromWindow)
  );

  onBeforeUnmount(() =>
    document.body.removeEventListener("click", handleClickEventFromWindow)
  );

  return {
    wrapperElement,
    contentElement,
    showWrapperElement,
    showContentElement,
    open,
    handleAfterEnterEventFromWrapperElement,
    handleAfterEnterEventFromContentElement,
    close,
    handleAfterLeaveEventFromWrapperElement,
    handleAfterLeaveEventFromContentElement,
  };
}
