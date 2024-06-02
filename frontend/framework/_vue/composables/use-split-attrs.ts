import { computed, useAttrs, type ComputedRef } from "vue";

export interface SplitAttrs {
  nonStyleAttrs: ComputedRef;
  styleAttrs: ComputedRef<{ class: string; style: string }>;
}

export function useSplitAttrs(): SplitAttrs {
  const nonStyleAttrs = computed(() => {
    const attrs = { ...useAttrs() };
    delete attrs.class;
    delete attrs.style;

    return attrs;
  });

  const styleAttrs = computed(() => {
    const attrs = useAttrs();

    return {
      class: typeof attrs.class === "string" ? attrs.class : "",
      style: typeof attrs.style === "string" ? attrs.style : "",
    };
  });

  return {
    nonStyleAttrs,
    styleAttrs,
  };
}
