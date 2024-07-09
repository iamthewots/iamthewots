export interface PointerGestureSettings {
  minPointers?: number;
  maxPointers?: number;
  pointerTypesAllowed?: PointerType[] | "all";
  defaultMouseButton?: MouseButton;
}

type PointerType = "mouse" | "pen" | "touch" | "unknown";

enum MouseButton {
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
  coordinatesHistory: {
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
  _pointersDataArray: PointerData[] = [];
  #minPointers: number;
  #maxPointers: number;
  #pointerTypesAllowed: PointerType[] | "all";
  #defaultMouseButton: MouseButton;

  constructor(element: HTMLElement, settings: PointerGestureSettings = {}) {
    this._element = element;
    this.#minPointers = settings.minPointers ?? 1;
    this.#maxPointers = settings.maxPointers ?? this.#minPointers;
    this.#pointerTypesAllowed = settings.pointerTypesAllowed ?? "all";
    this.#defaultMouseButton = settings.defaultMouseButton ?? MouseButton.Main;
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

  #handlePointerDownEvent(e: PointerEvent) {}

  #handlePointerMoveEvent(e: PointerEvent) {}

  #handlePointerLeaveEvent(e: PointerEvent) {}

  #handlePointerUpEvent(e: PointerEvent) {}

  _deletePointerData(e: PointerEvent) {}

  _findPointerDataIndex(e: PointerEvent) {
    return this._pointersDataArray.findIndex((pointerData) => {
      return pointerData.pointerId === e.pointerId;
    });
  }

  #isPointerTypeValid(e: PointerEvent) {
    if (
      this.#pointerTypesAllowed !== "all" &&
      this.#pointerTypesAllowed.includes(e.type as PointerType) === false
    ) {
      return false;
    } else {
      return true
    }
  }
}
