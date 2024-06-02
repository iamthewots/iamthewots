import type { VueEmits } from "@_vue/types";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface DialogToolsProps {
  closeOnClickOutside?: boolean;
}

export interface DialogToolsEmits<P extends string> {
  (e: `${P}open-start`): void;
  (e: `${P}open-end`): void;
  (e: `${P}close-start`): void;
  (e: `${P}close-end`): void;
}

export interface DialogToolsSettings {
  closeOnClickOutside: boolean;
  emits: VueEmits;
  emitsEventPrefix: string;
}

export interface DialogTools {
  wrapperElement: Ref<HTMLElement | null>;
  contentElement: Ref<HTMLElement | null>;
  showWrapperElement: Ref<boolean>;
  showContentElement: Ref<boolean>;
  open: () => void;
  close: () => void;
  handleAfterEnterFromWrapperElement: () => void;
  handleAfterEnterFromContentElement: () => void;
  handleAfterLeaveFromContentElement: () => void;
  handleAfterLeaveFromWrapperElement: () => void;
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

    const { emits, emitsEventPrefix } = settings;
    showWrapperElement.value = true;
    emits(`${emitsEventPrefix}open-start`);
  }

  function close() {
    if (showContentElement.value === false) {
      return;
    }

    const { emits, emitsEventPrefix } = settings;
    showContentElement.value = false;
    emits(`${emitsEventPrefix}close-start`);
  }

  function handleAfterEnterFromWrapperElement() {
    showContentElement.value = true;
  }

  function handleAfterEnterFromContentElement() {
    const { emits, emitsEventPrefix } = settings;
    emits(`${emitsEventPrefix}open-end`);
  }

  function handleAfterLeaveFromContentElement() {
    showWrapperElement.value = false;
  }

  function handleAfterLeaveFromWrapperElement() {
    const { emits, emitsEventPrefix } = settings;
    emits(`${emitsEventPrefix}close-end`);
  }

  function handleClickEventFromWindow(e: Event) {
    const { closeOnClickOutside } = settings;

    if (
      showWrapperElement.value === false ||
      wrapperElement.value === null ||
      contentElement.value === null ||
      e.target instanceof Element === false
    ) {
      return;
    }

    if (
      contentElement.value === e.target ||
      contentElement.value.contains(e.target)
    ) {
      return;
    } else if (closeOnClickOutside === true) {
      close();
    }
  }

  onMounted(() => {
    window.addEventListener("click", handleClickEventFromWindow);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("click", handleClickEventFromWindow);
  });

  return {
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
  };
}
