export interface PointerProps {
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export function trackPointerFromElement(
  e: MouseEvent | PointerEvent,
  targetElement: Element
): PointerProps {
  const { left, width, top, height } = targetElement.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 2 - 1;
  const y = ((e.clientY - top) / height) * 2 - 1;
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 1.414;

  return { x, y, angle, distance };
}

export function isPointerInsideElement(
  e: PointerEvent,
  targetElement: Element
) {
  const { x, width, y, height } = targetElement.getBoundingClientRect();

  return (
    e.clientX >= x &&
    e.clientX <= x + width &&
    e.clientY >= y &&
    e.clientY <= y + height
  );
}
