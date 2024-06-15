import { trackPointerFromElement, type PointerProps } from "@_lib/pointer-tracker";
import type { DirectiveBinding } from "vue";

export function trackMouseDirective(
  element: HTMLElement,
  binding: DirectiveBinding<PointerProps>
) {
  element.addEventListener("mousemove", (e: Event) => {
    const mouseProps = trackPointerFromElement(e as MouseEvent, element);

    let key: keyof typeof mouseProps;
    for (key in mouseProps) {
      const value = mouseProps[key];
      const propertyName = `--mouse-${key}`;
      const propertyValue = value.toString();
      element.style.setProperty(propertyName, propertyValue);
    }

    binding.value = mouseProps;
  });
}

// convert to setup
