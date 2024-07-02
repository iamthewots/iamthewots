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
    this._element.addEventListener(
      "pointerdown",
      this.#handlePointerDownEvent.bind(this)
    );
    this._element.addEventListener(
      "pointermove",
      this.#handlePointerMoveEvent.bind(this)
    );
    this._element.addEventListener(
      "pointerleave",
      this.#handlePointerLeaveEvent.bind(this)
    );
    this._element.addEventListener(
      "pointerup",
      this.#handlePointerUpEvent.bind(this)
    );
  }

  disconnect() {
    this._element.removeEventListener(
      "pointerdown",
      this.#handlePointerDownEvent.bind(this)
    );
    this._element.removeEventListener(
      "pointermove",
      this.#handlePointerMoveEvent.bind(this)
    );
    this._element.removeEventListener(
      "pointerleave",
      this.#handlePointerLeaveEvent.bind(this)
    );
    this._element.removeEventListener(
      "pointerup",
      this.#handlePointerUpEvent.bind(this)
    );
  }

  _handleGestureStart(_e: PointerEvent) {}

  _handleGesture(_e: PointerEvent) {}

  _handleGestureEnd(_e: PointerEvent) {}

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

export class PanGesture extends PointerGesture {
  constructor(element: HTMLElement) {
    super(element, {
      pointersRequired: 1,
    });
  }

  _handleGestureStart(_e: PointerEvent) {
    this._element.dispatchEvent(new Event("pan-start"));
  }

  _handleGesture(e: PointerEvent) {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    const { distanceX, distanceY } = this.#getDistance(pointerData);
    const event = new CustomEvent("pan", {
      detail: { distanceX, distanceY },
    });
    this._element.dispatchEvent(event);
  }

  _handleGestureEnd(e: PointerEvent) {
    this._element.dispatchEvent(new Event("pan-end"));
  }

  #getDistance(pointerData: PointerData) {
    const { pointerHistory } = pointerData;
    const [firstPoint] = pointerHistory;
    const [lastPoint] = pointerHistory.slice(-1);
    const distanceX = lastPoint.x - firstPoint.x;
    const distanceY = lastPoint.y - firstPoint.y;

    return { distanceX, distanceY };
  }
}

export class SwipeGesture extends PointerGesture {
  #threshold: number;
  #maxTimeout = 1000;

  constructor(
    element: HTMLElement,
    pointersRequired: number,
    threshold: number
  ) {
    super(element, { pointersRequired });
    this.#threshold = Math.abs(threshold);
  }

  _handleGestureEnd(e: PointerEvent): void {
    const pointerData = this._pointersMap.get(e.pointerId);

    if (
      pointerData === undefined ||
      this.#isTimeoutValid(pointerData) === false
    ) {
      return;
    }

    const { distanceX, distanceY } = this.#getDistance(pointerData);

    if (distanceX > 0 && distanceX >= this.#threshold) {
      this._element.dispatchEvent(new Event("swipe-right"));
    } else if (distanceX < 0 && distanceX <= this.#threshold * -1) {
      this._element.dispatchEvent(new Event("swipe-left"));
    }

    if (distanceY > 0 && distanceY >= this.#threshold) {
      this._element.dispatchEvent(new Event("swipe-down"));
    } else if (distanceY < 0 && distanceY <= this.#threshold * -1) {
      this._element.dispatchEvent(new Event("swipe-up"));
    }
  }

  #isTimeoutValid(pointerData: PointerData) {
    const { timestamp } = pointerData;
    const timeout = Date.now() - timestamp;

    return timeout <= this.#maxTimeout;
  }

  #getDistance(pointerData: PointerData) {
    const { pointerHistory } = pointerData;
    const [firstPoint] = pointerHistory;
    const [lastPoint] = pointerHistory.slice(-1);
    const distanceX = lastPoint.x - firstPoint.x;
    const distanceY = lastPoint.y - firstPoint.y;

    return { distanceX, distanceY };
  }
}
