type GestureCallback = () => void;

interface PointerData {
  index: number;
  isActive: boolean;
  history: { x: number; y: number }[];
  timestamp: number;
}

export interface PointerGestureSettings {
  eventTypesAllowed?: ("mouse" | "pen" | "touch")[] | "all";
  mouseDownButton?: number;
}

export class PointerGesture {
  #element: HTMLElement;
  #pointersRequired: number;
  #pointersMap: Map<number, PointerData> = new Map();
  #eventTypesAllowed = "all";
  #mouseButton = 0;

  constructor(element: HTMLElement, pointersRequired: number) {
    this.#element = element;
    this.#pointersRequired = Math.max(pointersRequired, 0);
    this.#addEventListeners();
  }

  #addEventListeners() {
    this.#element.addEventListener(
      "pointerenter",
      this.#handlePointerEnterEvent.bind(this)
    );
    this.#element.addEventListener(
      "pointermove",
      this.#handleTouchMoveEvent.bind(this)
    );
    this.#element.addEventListener(
      "pointerleave",
      this.#handlePointerLeaveEvent.bind(this)
    );
    this.#element.addEventListener(
      "pointerdown",
      this.#handlePointerDownEvent.bind(this)
    );
    this.#element.addEventListener(
      "pointerup",
      this.#handlePointerUpEvent.bind(this)
    );
  }

  #handlePointerEnterEvent(e: PointerEvent) {
    if (
      this.#pointersMap.size >= this.#pointersRequired ||
      this.#pointersMap.has(e.pointerId) ||
      this.#isEventTypeValid(e) === false
    ) {
      return;
    }

    this.#pointersMap.set(e.pointerId, {
      index: this.#pointersMap.size,
      isActive: false,
      history: [],
      timestamp: Date.now(),
    });
  }

  #handleTouchMoveEvent(e: PointerEvent) {
    const pointerData = this.#pointersMap.get(e.pointerId);

    if (pointerData === undefined || pointerData.isActive === false) {
      return;
    }
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    const pointerData = this.#pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }
  }

  #handlePointerDownEvent(e: PointerEvent) {
    const pointerData = this.#pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    if (e.type === "mouse") {
      pointerData.isActive = e.button === this.#mouseButton;
    } else {
      pointerData.isActive = true;
    }
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this.#pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    if (e.type === "mouse") {
      if (e.button === this.#mouseButton) {
        pointerData.isActive = false;
      }
    } else {
      pointerData.isActive = false;
    }
  }

  #isEventTypeValid(e: PointerEvent) {
    if (this.#eventTypesAllowed === "all") {
      return true;
    } else {
      return this.#eventTypesAllowed.includes(e.type);
    }
  }
}
