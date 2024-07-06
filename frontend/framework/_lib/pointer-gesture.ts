// reformat with a addCallback with a object with start, active, end keys

export interface PointerGestureSettings {
  minPointers?: number;
  maxPointers?: number;
  mainPointerIndex?: number;
  pointerTypesAllowed: PointerType[] | "all";
  gestureIsActiveOnlyWhenMainPointerMove?: boolean;
  mouseDownButton?: MouseButton;
  penDownButton?: number;
}

interface PointerData {
  index: number;
  type: PointerType;
  coordinatesHistory: { x: number; y: number; timestamp: number }[];
  timestamp: number;
}

type PointerType = "mouse" | "pen" | "touch";

export enum MouseButton {
  "Main" = 0,
  "Auxiliary" = 1,
  "Secondary" = 2,
  "BrowserBack" = 3,
  "BrowserForward" = 4,
}

export class PointerGesture {
  _element: HTMLElement;
  #minPointers: number;
  #maxPointers: number;
  _pointersDataMap: Map<number, PointerData> = new Map();
  _mainPointerData?: PointerData;
  #mainPointerIndex: number;
  #pointerTypesAllowed: PointerType[] | "all";
  #gestureIsActiveOnlyWhenMainPointerMove: boolean;
  #mouseDownButton: MouseButton;
  #penDownButton: number;

  constructor(element: HTMLElement, settings: PointerGestureSettings) {
    this._element = element;
    this.#minPointers = settings.minPointers ?? 1;
    this.#maxPointers = settings.maxPointers ?? this.#minPointers;
    this.#mainPointerIndex = settings.mainPointerIndex ?? 0;
    this.#pointerTypesAllowed = settings.pointerTypesAllowed ?? "all";
    this.#gestureIsActiveOnlyWhenMainPointerMove =
      !!settings.gestureIsActiveOnlyWhenMainPointerMove;
    this.#mouseDownButton = settings.mouseDownButton ?? MouseButton.Main;
    this.#penDownButton = settings.penDownButton ?? 0;
    this.connect();
  }

  connect() {
    this.#manageEventListeners("add");
  }

  disconnect() {
    this.#manageEventListeners("remove");
  }

  handleGestureStart(_e: PointerEvent) {}

  handleGestureActive(_e: PointerEvent) {}

  handleGestureEnd(_e: PointerEvent) {}

  findPointerDataByIndex(index: number) {}

  getPointerAngle(pointerData: PointerData, historyIndex?: number) {
    const pointerDistanceData = this.getPointerDistance(
      pointerData,
      historyIndex
    );

    if (pointerDistanceData === undefined) {
      return;
    }

    const { distanceX, distanceY } = pointerDistanceData;
    const angle = Math.atan2(distanceY, distanceX) * (180 / Math.PI);

    return angle;
  }

  getPointerDistance(pointerData: PointerData, historyIndex?: number) {
    const { coordinatesHistory } = pointerData;
    historyIndex ??= coordinatesHistory.length - 1;

    if (
      historyIndex < 0 ||
      historyIndex > pointerData.coordinatesHistory.length - 1
    ) {
      return;
    }

    const [pointA] = coordinatesHistory;
    const pointB = coordinatesHistory[historyIndex];
    const distanceX = pointB.x - pointA.x;
    const distanceY = pointB.y - pointA.y;
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

    return { distanceX, distanceY, distance };
  }

  getPointersMidPoint(historyIndex: number) {
    if (this._mainPointerData === undefined) {
      return;
    }

    historyIndex ??= this._mainPointerData.coordinatesHistory.length - 1;

    if (
      historyIndex < 0 ||
      historyIndex > this._mainPointerData.coordinatesHistory.length - 1
    ) {
      return;
    }

    let x = 0;
    let y = 0;
    Array.from(this._pointersDataMap.values()).forEach((pointerData) => {
      const { coordinatesHistory } = pointerData;
      const point = coordinatesHistory[historyIndex];
      x += point.x;
      y += point.y;
    });
    x /= this._pointersDataMap.size;
    y /= this._pointersDataMap.size;

    return { x, y };
  }

  #manageEventListeners(method: "add" | "remove") {
    const fn =
      method === "add"
        ? this._element.addEventListener.bind(this._element)
        : this._element.removeEventListener.bind(this._element);
    fn("pointerdown", this.#handlePointerDownEvent.bind(this));
    fn("pointermove", this.#handlePointerMoveEvent.bind(this));
    fn("pointerleave", this.#handlePointerLeaveEvent.bind(this));
    fn("pointerup", this.#handlePointerUpEvent.bind(this));
  }

  #handlePointerDownEvent(e: PointerEvent) {
    if (
      this._pointersDataMap.size > this.#maxPointers ||
      this._pointersDataMap.has(e.pointerId) ||
      this.#isPointerEventValid(e) === false
    ) {
      return;
    }

    const pointerData: PointerData = {
      index: this._pointersDataMap.size,
      type: e.type as PointerType,
      coordinatesHistory: [
        { x: e.clientX, y: e.clientY, timestamp: Date.now() },
      ],
      timestamp: Date.now(),
    };
    this._pointersDataMap.set(e.pointerId, pointerData);

    if (pointerData.index === this.#mainPointerIndex) {
      this._mainPointerData = pointerData;
    }

    if (this._pointersDataMap.size === this.#minPointers) {
      this.handleGestureStart(e);
    }
  }

  #handlePointerMoveEvent(e: PointerEvent) {
    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    pointerData.coordinatesHistory.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    });

    if (
      this.#gestureIsActiveOnlyWhenMainPointerMove &&
      pointerData.index !== this.#mainPointerIndex
    ) {
      return;
    }

    this.handleGestureActive(e);
  }

  #handlePointerLeaveEvent(e: PointerEvent) {
    this.#handlePointerInteractionEnd(e);
  }

  #handlePointerUpEvent(e: PointerEvent) {
    if (this.#isPointerEventValid(e) === false) {
      return;
    }

    this.#handlePointerInteractionEnd(e);
  }

  #handlePointerInteractionEnd(e: PointerEvent) {
    const pointerData = this._pointersDataMap.get(e.pointerId);

    if (pointerData === undefined) {
      return;
    }

    const { index } = pointerData;
    this._pointersDataMap.delete(e.pointerId);

    if (
      index === this.#mainPointerIndex ||
      this._pointersDataMap.size < this.#minPointers
    ) {
      this.handleGestureEnd(e);
      this._mainPointerData = undefined;
      this._pointersDataMap.clear();
    }
  }

  #isPointerEventValid(e: PointerEvent) {
    if (
      this.#pointerTypesAllowed !== "all" &&
      this.#pointerTypesAllowed.includes(e.type as PointerType) === false
    ) {
      return false;
    }

    if (
      (e.type === "mouse" && e.button !== this.#mouseDownButton) ||
      (e.type === "pen" && e.button !== this.#penDownButton)
    ) {
      return false;
    }

    return true;
  }
}
