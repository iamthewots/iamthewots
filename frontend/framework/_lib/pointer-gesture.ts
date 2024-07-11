export interface PointerGestureSettings {
  pointersRequired?: number;
  pointerTypesAllowed?: PointerType[] | "all";
  defaultMouseButton?: MouseButton;
}

type PointerType = "mouse" | "pen" | "touch" | "unknown";

export enum MouseButton {
  "Main" = 0,
  "Auxiliary" = 1,
  "Secondary" = 2,
  "BrowserBack" = 3,
  "BrowserForward" = 4,
}

export interface PointerData {
  pointerId: number;
  type: PointerType;
  buttonsDown: Set<number>;
  points: {
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    distance: number;
    angle: number;
    timestamp: number;
  }[];
}

export class PointerGesture {
  _element: HTMLElement;
  _pointersDataMap: Map<number, PointerData> = new Map();
  #pointersRequired: number;
  #pointerTypesAllowed: PointerType[] | "all";
  #defaultMouseButton: MouseButton;
  #isActive = false;

  constructor(element: HTMLElement, settings: PointerGestureSettings = {}) {
    this._element = element;
    this.#pointersRequired = settings.pointersRequired ?? 1;
    this.#pointerTypesAllowed = settings.pointerTypesAllowed ?? "all";
    this.#defaultMouseButton = settings.defaultMouseButton ?? MouseButton.Main;
  }

  findPointerDataByIndex(index: number) {
    if (index < 0 || index > this._pointersDataMap.size) {
      return;
    }

    const key = Array.from(this._pointersDataMap.keys())[index];

    return this._pointersDataMap.get(key);
  }

  connect() {
    this.#manageEventListeners("add");
  }

  disconnect() {
    this.#manageEventListeners("remove");
  }

  #manageEventListeners(method: "add" | "remove") {
    const fn = (
      method === "add"
        ? this._element.addEventListener
        : this._element.removeEventListener
    ).bind(this._element);
    fn("pointerdown", this.#handlePointerDownEvent.bind(this));
    fn("pointermove", this.#handlePointerMoveEvent.bind(this));
    fn("pointerleave", this.#handlePointerLeaveEvent.bind(this));
    fn("pointerup", this.#handlePointerUpEvent.bind(this));
  }

  #handlePointerDownEvent(e: PointerEvent) {
    if (this.#isPointerTypeValid(e) === false) {
      return;
    }

    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData !== undefined) {
      pointerData.buttonsDown.add(e.button);

      return;
    }

    if (this.#mustAddPointerToMap(e) === false) {
      return;
    }

    this._pointersDataMap.set(e.pointerId, {
      pointerId: e.pointerId,
      type: (e.type as PointerType) ?? "unknown",
      buttonsDown: new Set<number>([e.button]),
      points: [],
    });

    if (this._pointersDataMap.size === this.#pointersRequired) {
      this.#isActive = true;
      this._handleGestureStart(e);
    }
  }

  #handlePointerMoveEvent(e: PointerEvent) {
    if (this.#isActive === false) {
      return;
    }

    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    if (pointerData.points.length === 0) {
      pointerData.points.push({
        x: e.clientX,
        y: e.clientY,
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        angle: 0,
        timestamp: Date.now(),
      });
    } else {
      const [firstPoint] = pointerData.points;
      const x = e.clientX;
      const y = e.clientY;
      const deltaX = x - firstPoint.x;
      const deltaY = y - firstPoint.y;
      const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      pointerData.points.push({
        x,
        y,
        deltaX,
        deltaY,
        distance,
        angle,
        timestamp: Date.now(),
      });
    }

    this._handleGestureMove(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    if (this.#isActive === false) {
      this._pointersDataMap.delete(e.pointerId);

      return;
    }

    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    this.#isActive = false;
    this._handleGestureEnd(e);
    this._pointersDataMap.clear();
  }

  #handlePointerUpEvent(e: PointerEvent) {
    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    pointerData.buttonsDown.delete(e.button);

    if (
      pointerData.buttonsDown.size === 0 ||
      (e.type === "mouse" &&
        pointerData.buttonsDown.has(this.#defaultMouseButton) === false)
    ) {
      this.#isActive = false;
      this._handleGestureEnd(e);
      this._pointersDataMap.clear();
    }
  }

  _handleGestureStart(e: PointerEvent) {}

  _handleGestureMove(e: PointerEvent) {}

  _handleGestureEnd(e: PointerEvent) {}

  #isPointerTypeValid(e: PointerEvent) {
    if (
      this.#pointerTypesAllowed !== "all" &&
      this.#pointerTypesAllowed.includes(e.type as PointerType) === false
    ) {
      return false;
    } else {
      return true;
    }
  }

  #mustAddPointerToMap(e: PointerEvent) {
    if (this._pointersDataMap.size >= this.#pointersRequired) {
      return false;
    } else if (e.type === "mouse" && e.button !== this.#defaultMouseButton) {
      return false;
    } else if (this._pointersDataMap.has(e.pointerId)) {
      return false;
    }

    return true;
  }
}
