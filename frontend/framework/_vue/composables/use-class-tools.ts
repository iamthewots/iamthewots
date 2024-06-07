import { computed } from "vue";

export interface ClassToggles<D> {
  [className: string]: (evaluationData: D) => boolean;
}

export function useClassTools<D>(evaluationData: D, classToggles: ClassToggles<D> = {}) {
  const classNames = computed(() => {
    const activeClassNames: string[] = [];
    const inactiveClassNames: string[] = [];
    for (const className in classToggles) {
      const toggleFunction = classToggles[className];

      if (toggleFunction(evaluationData)) {
        activeClassNames.push(className);
      } else {
        inactiveClassNames.push(className);
      }
    }

    return { activeClassNames, inactiveClassNames };
  });

  return { classNames };
}
