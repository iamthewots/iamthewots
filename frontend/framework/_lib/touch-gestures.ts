interface GestureUpdateEventPayload {
  angle: number;
  distance: number;
  travelX: number;
  travelY: number;
}

export class TouchGestures {
  #element: HTMLElement;
  #pointersRequired: number;
  #pointersMap: Map<number, boolean> = new Map();
  #isActive = false;
  #angle = 0;
  #distance = 0;
  #travelX = 0;
  #travelY = 0;

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
      this.#handlePointerMoveEvent.bind(this)
    );
    this.#element.addEventListener(
      "pointerleave",
      this.#handlePointerLeaveEvent.bind(this)
    );
  }

  #handlePointerEnterEvent(e: PointerEvent) {
    if (
      this.#pointersMap.has(e.pointerId) ||
      this.#pointersMap.size >= this.#pointersRequired
    ) {
      return;
    }

    this.#pointersMap.set(e.pointerId, this.#pointersMap.size === 0);

    if (this.#pointersMap.size == this.#pointersRequired) {
      const event = new CustomEvent("touch-gestures:gesture-start");
      this.#element.dispatchEvent(event);
    }
  }

  #handlePointerMoveEvent(e: PointerEvent) {
    const event = new CustomEvent<GestureUpdateEventPayload>(
      "touch-gestures:gesture-update",
      {
        detail: {
          angle: this.#angle,
          distance: this.#distance,
          travelX: this.#travelX,
          travelY: this.#travelY,
        },
      }
    );
    this.#element.dispatchEvent(event);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    if (this.#pointersMap.has(e.pointerId) === false) {
      return;
    }

    const event = new CustomEvent("touch-gestures:gesture-end");
    this.#element.dispatchEvent(event);
  }
}
