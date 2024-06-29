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

export abstract class PointerGesture {
  _element: HTMLElement;
  _pointersMap: Map<number, PointerData> = new Map();
  #pointersRequired: number;
  #eventTypesAllowed: PointerType[] | "all";
  #mouseDownButton: number;

  constructor(
    element: HTMLElement,
    settings: Partial<PointerGestureSettings> = {}
  ) {
    this._element = element;
    this.#pointersRequired = Math.max(settings.pointersRequired ?? 1, 0);
    this.#eventTypesAllowed = settings.eventTypesAllowed ?? "all";
    this.#mouseDownButton = settings.mouseDownButton ?? 0;
    this.connect();
  }

  connect() {
    console.log(this._element);
    this.#manageEventListeners(1);
  }

  disconnect() {
    this.#manageEventListeners(0);
  }

  _handleGestureStart(_e: PointerEvent) {}

  _handleGesture(_e: PointerEvent) {}

  _handleGestureEnd(_e: PointerEvent) {}

  #manageEventListeners(action: 1 | 0) {
    const fn =
      action === 1
        ? this._element.addEventListener
        : this._element.removeEventListener;
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
      this._handleGestureStart(e);
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
    this._handleGesture(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    console.log("calzone");
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this._handleGestureEnd(e);
    this._pointersMap.clear();
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this._handleGestureEnd(e);
    this._pointersMap.clear();
  }

  #isPointerTypeAllowed(e: PointerEvent) {
    if (this.#eventTypesAllowed === "all") {
      return true;
    } else {
      return this.#eventTypesAllowed.includes(e.type as PointerType);
    }
  }
}

export class SwipeGesture extends PointerGesture {
  constructor(element: HTMLElement) {
    super(element, {
      pointersRequired: 1,
    });
  }

  _handleGestureStart(_e: PointerEvent) {
    this._element.dispatchEvent(new Event("swipe-start"));
  }

  _handleGesture(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    const { pointerHistory } = pointerData;
    const [firstPoint] = pointerHistory;
    const [lastPoint] = pointerHistory.slice(-1);
    const distanceX = lastPoint.x - firstPoint.x;
    const distanceY = lastPoint.y - firstPoint.y;
    const event = new CustomEvent("swipe", {
      detail: { distanceX, distanceY },
    });
    this._element.dispatchEvent(event);
  }

  _handleGestureEnd(_e: PointerEvent) {
    this._element.dispatchEvent(new Event("swipe-end"));
  }
}
