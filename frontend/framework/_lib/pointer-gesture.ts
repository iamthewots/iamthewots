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

export class PointerGesture {
  _element: HTMLElement;
  _pointersMap: Map<number, PointerData> = new Map();
  _handleGestureStart?: (e: PointerEvent) => void;
  _handleGestureActive?: (e: PointerEvent) => void;
  _handleGestureEnd?: (e: PointerEvent) => void;
  #pointersRequired: number;
  #eventTypesAllowed: PointerType[] | "all";
  #mouseDownButton: number;

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
      this._handleGestureStart?.(e);
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
    this._handleGestureActive?.(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this._handleGestureEnd?.(e);
    this._pointersMap.clear();
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this._handleGestureEnd?.(e);
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

interface PointerSwipeGestureSettings extends PointerGestureSettings {
  threshold: number;
  timeout: number;
}

export class PointerSwipeGesture extends PointerGesture {
  #threshold: number;
  #timeout: number;

  constructor(
    element: HTMLElement,
    settings: Partial<PointerSwipeGestureSettings>
  ) {
    super(element, settings);
    this.#threshold = Math.max(settings.threshold ?? 100, 0);
    this.#timeout = Math.max(settings.timeout ?? 1000, 0);
    this._handleGestureEnd = this.#handleGestureEnd;
  }

  #handleGestureEnd(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (
      pointerData === undefined ||
      this.#isSwipeTimingValid(pointerData) === false
    ) {
      return;
    }

    const { coordinatesHistory } = pointerData;
    const [firstPoint] = coordinatesHistory;
    const [lastPoint] = coordinatesHistory.slice(-1);
    const distanceX = lastPoint.x - firstPoint.x;
    const distanceY = lastPoint.y - firstPoint.y;
    const swipeValues: { [key: string]: boolean } = {
      left: distanceX < 0 && distanceX <= this.#threshold * -1,
      right: distanceX > 0 && distanceX >= this.#threshold,
      up: distanceY < 0 && distanceY <= this.#threshold * -1,
      down: distanceY > 0 && distanceY >= this.#threshold,
    };

    for (let swipeDirection in swipeValues) {
      const swipeIsValid = swipeValues[swipeDirection];

      if (swipeIsValid) {
        this._element.dispatchEvent(new Event(`swipe-${swipeDirection}`));
      }
    }

    const event = new CustomEvent("swipe", {
      detail: { distanceX, distanceY },
    });
    this._element.dispatchEvent(event);
  }

  #isSwipeTimingValid(pointerData: PointerData) {
    const { timestamp } = pointerData;

    return Date.now() - timestamp <= this.#timeout;
  }
}
