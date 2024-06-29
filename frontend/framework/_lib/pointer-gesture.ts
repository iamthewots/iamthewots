interface PointerData {
  index: number;
  pointerHistory: { x: number; y: number }[];
  timestamp: number;
}

interface PointerGestureSettings {
  pointersRequired?: number;
  eventTypesAllowed?: PointerType[] | "all";
  mouseDownButton?: number;
}

type PointerType = "mouse" | "pen" | "touch";

export class PointerGesture {
  _gestureName: string;
  _pointersMap: Map<number, PointerData> = new Map();
  #element: HTMLElement;
  #pointersRequired: number;
  #eventTypesAllowed: PointerType[] | "all";
  #mouseDownButton: number;

  constructor(
    element: HTMLElement,
    gestureName: string,
    settings: Partial<PointerGestureSettings> = {}
  ) {
    this.#element = element;
    this._gestureName = gestureName;
    this.#pointersRequired = Math.max(settings.pointersRequired ?? 1, 0);
    this.#eventTypesAllowed = settings.eventTypesAllowed ?? "all";
    this.#mouseDownButton = settings.mouseDownButton ?? 0;
  }

  connect() {
    this.#manageEventListeners(1);
  }

  disconnect() {
    this.#manageEventListeners(0);
  }

  #manageEventListeners(action: 1 | 0) {
    const fn =
      action === 1
        ? this.#element.addEventListener
        : this.#element.removeEventListener;
    fn("pointerdown", this.#handlePointerDownEvent.bind(this));
    fn("pointermove", this.#handlePointerMoveEvent.bind(this));
    fn("pointerleave", this.#handlePointerLeaveEvent.bind(this));
    fn("pointerup", this.#handlePointerUpEvent.bind(this));
  }

  #handlePointerDownEvent(e: PointerEvent) {
    if (
      this._pointersMap.size >= this.#pointersRequired ||
      this._pointersMap.has(e.pointerId) ||
      this.#isPointerTypeAllowed(e) === false ||
      (e.type === "mouse" && e.button !== this.#mouseDownButton)
    ) {
      return;
    }

    const pointerData: PointerData = {
      index: this._pointersMap.size,
      pointerHistory: [{ x: e.clientX, y: e.clientY }],
      timestamp: Date.now(),
    };
    this._pointersMap.set(e.pointerId, pointerData);

    if (this._pointersMap.size === this.#pointersRequired) {
      this.#handleGestureStart(e);
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

    pointerData.pointerHistory.push({ x: e.clientX, y: e.clientY });
    this.#handleGesture(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this.#handleGestureEnd(e);
    this._pointersMap.clear();
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this.#handleGestureEnd(e);
    this._pointersMap.clear();
  }

  #handleGestureStart(_e: PointerEvent) {}

  #handleGesture(_e: PointerEvent) {}

  #handleGestureEnd(_e: PointerEvent) {}

  #isPointerTypeAllowed(e: PointerEvent) {
    if (this.#eventTypesAllowed === "all") {
      return true;
    } else {
      return this.#eventTypesAllowed.includes(e.type as PointerType);
    }
  }

  get pointersMap() {
    return this._pointersMap;
  }
}

export class SwipeGesture extends PointerGesture {
  constructor(element: HTMLElement) {
    super(element, "swipe", {
      pointersRequired: 1,
    });
  }

  #handleGestureStart(_e: PointerEvent) {}

  #handleGesture(_e: PointerEvent) {}

  #handleGestureEnd(_e: PointerEvent) {}
}
