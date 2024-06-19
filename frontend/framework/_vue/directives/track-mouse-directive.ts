import {
  trackPointerFromElement,
  type PointerProps,
} from "@_lib/pointer-tracker";
import type { DirectiveBinding } from "vue";

export function trackMouseDirective(
  element: HTMLElement,
  binding: DirectiveBinding<PointerProps>
) {
  function setMouseProps(mouseProps: PointerProps) {
    let key: keyof typeof mouseProps;
    for (key in mouseProps) {
      const value = mouseProps[key];
      const propertyName = `--mouse-${key}`;
      const propertyValue = value.toString();
      element.style.setProperty(propertyName, propertyValue);
    }
  }

  element.addEventListener("mouseenter", () => {
    element.classList.add("track-mouse-directive--active");
    element.classList.remove("track-mouse-directive--inactive");
  });

  element.addEventListener("mousemove", (e: Event) => {
    const mouseProps = trackPointerFromElement(e as MouseEvent, element);
    setMouseProps(mouseProps);
    binding.value = mouseProps;
  });

  element.addEventListener("mouseleave", () => {
    element.classList.add("track-mouse-directive--inactive");
    element.classList.remove("track-mouse-directive--active");

    if (binding.modifiers.resetOnLeave) {
      setMouseProps({
        x: 0,
        y: 0,
        angle: 0,
        distance: 0,
      });
    }
  });
}
