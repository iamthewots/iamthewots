import { computed } from "vue";

export interface ClassToggles<T> {
  [className: string]: (data: T) => boolean;
}

export function useClassTools<T>(data: T, classToggles: ClassToggles<T> = {}) {
  const classNames = computed(() => {
    const activeClassNames: string[] = [];
    const inactiveClassNames: string[] = [];
    for (const className in classToggles) {
      const toggle = classToggles[className];

      if (toggle(data)) {
        activeClassNames.push(className);
      } else {
        inactiveClassNames.push(className);
      }
    }

    return { activeClassNames, inactiveClassNames };
  });

  return { classNames };
}
