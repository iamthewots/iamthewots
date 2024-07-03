interface PointerData {
  index: number;
  coordinatesHistory: { x: number; y: number; timestamp: number }[];
  timestamp: number;
}

interface PointerGestureSettings {
  pointersRequired?: number;
  eventTypesAllowed?: PointerType[] | "all";
  mouseDownButton?: number;
}

type PointerType = "mouse" | "pen" | "touch";

export class PointerGesture<T> {
  _element: HTMLElement;
  _pointersMap: Map<number, PointerData> = new Map();
  #pointersRequired: number;
  #eventTypesAllowed: PointerType[] | "all";
  #mouseDownButton: number;
  handleGestureStart?: (e: PointerEvent) => void;
  handleGestureActive?: (e: PointerEvent) => void;
  handleGestureEnd?: (e: PointerEvent) => void;

  constructor(element: HTMLElement, settings: PointerGestureSettings) {
    this._element = element;
    this.#pointersRequired = Math.max(settings.pointersRequired ?? 1, 0);
    this.#eventTypesAllowed = settings.eventTypesAllowed ?? "all";
    this.#mouseDownButton = settings.mouseDownButton ?? 0;
    this.connect();
  }

  connect() {
    this.#manageEventListeners("add");
  }

  disconnect() {
    this.#manageEventListeners("remove");
  }

  #manageEventListeners(action: "add" | "remove") {
    const fn =
      action === "add"
        ? this._element.addEventListener.bind(this._element)
        : this._element.removeEventListener.bind(this._element);
    fn("pointerdown", this.#handlePointerDownEvent.bind(this));
    fn("pointermove", this.#handlePointerMoveEvent.bind(this));
    fn("pointerleave", this.#handlePointerLeaveEvent.bind(this));
    fn("pointerup", this.#handlePointerUpEvent.bind(this));
  }

  #handlePointerDownEvent(e: PointerEvent) {
    if (
      this._pointersMap.size >= this.#pointersRequired ||
      this._pointersMap.has(e.pointerId) ||
      this.#isPointerTypeValid(e) === false ||
      (e.type === "mouse" && e.button !== this.#mouseDownButton)
    ) {
      return;
    }

    const pointerData: PointerData = {
      index: this._pointersMap.size,
      coordinatesHistory: [
        { x: e.clientX, y: e.clientY, timestamp: Date.now() },
      ],
      timestamp: Date.now(),
    };
    this._pointersMap.set(e.pointerId, pointerData);

    if (this._pointersMap.size === this.#pointersRequired) {
      this.handleGestureStart?.(e);
    }
  }

  #handlePointerMoveEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (
      pointerData === undefined ||
      this._pointersMap.size < this.#pointersRequired
    ) {
      return;
    }

    pointerData.coordinatesHistory.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    });
    this.handleGestureActive?.(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this.handleGestureEnd?.(e);
    this._pointersMap.clear();
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this.handleGestureEnd?.(e);
    this._pointersMap.clear();
  }

  #isPointerTypeValid(e: PointerEvent) {
    if (this.#eventTypesAllowed === "all") {
      return true;
    } else {
      return this.#eventTypesAllowed.includes(e.type as PointerType);
    }
  }
}

function addPointerSwipeGesture(element: HTMLElement) {
  const pointerGesture = new PointerGesture(element, { pointersRequired: 1 });

  pointerGesture.handleGestureEnd = function (
    this: PointerGesture<any>,
    e: PointerEvent
  ) {};
}
