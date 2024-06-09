import { computed, type ComputedRef } from "vue";

export interface ClassTools {
  classLists: ComputedRef<{
    activeClassList: string[];
    inactiveClassList: string[];
  }>;
}

export interface ClassSwitchers<D extends Object> {
  [key: string]: (evaluationData: D) => boolean;
}

export function useClassTools<D extends Object>(
  evaluationData: D,
  classSwitchers: ClassSwitchers<D> = {}
) {
  const classLists = computed(() => {
    const activeClassList: string[] = [];
    const inactiveClassList: string[] = [];

    for (const key in classSwitchers) {
      const className = key;
      const isClassNameActive = classSwitchers[key];

      if (typeof isClassNameActive === "function") {
        if (isClassNameActive(evaluationData)) {
          activeClassList.push(className);
        } else {
          inactiveClassList.push(className);
        }
      }
    }

    return { activeClassList, inactiveClassList };
  });

  return {
    classLists,
  };
}
