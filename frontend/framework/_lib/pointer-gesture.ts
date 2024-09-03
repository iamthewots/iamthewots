interface PointerData {
  id: number;
  type: PointerType;
  origin: PointerPoint;
  history: PointerPoint[];
  isInsideElement: boolean;
}

type PointerType = "mouse" | "pen" | "touch" | "unknown";

interface PointerPoint {
  x: number;
  y: number;
  timestamp: number;
}

export class PointerGesture {
  element = document.body;
  pointersDataMap: Map<number, PointerData> = new Map();
  pointersRequired = 1;
  pointerTypesAllowed: PointerType[] | "all" = "all";
  endGestureOnPointerLeave = true;

  connect() {}

  disconnect() {}

  manageEventListeners(method: "add" | "remove") {}

  handlePointerDownEvent(e: PointerEvent) {
    const pointerAlreadyExists = this.pointersDataMap.has(e.pointerId);
    const pointerTypeNotAllowed =
      this.pointerTypesAllowed !== "all" &&
      this.pointerTypesAllowed.includes(e.pointerType as PointerType) === false;

    if (pointerAlreadyExists || pointerTypeNotAllowed) {
      return;
    }
  }

  handlePointerMoveEvent(e: PointerEvent) {}

  handlePointerUpEvent(e: PointerEvent) {}

  handlePointerLeaveEvent(e: PointerEvent) {}

  handleGestureStart(e: PointerEvent) {}

  handleGestureActive(e: PointerEvent) {}

  handleGestureEnd(e: PointerEvent) {}
}
