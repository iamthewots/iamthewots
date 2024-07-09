import {
  PointerGesture,
  type PointerData,
  type PointerGestureSettings,
} from "./pointer-gesture";

export interface PointerSwipeGestureSettings extends PointerGestureSettings {
  threshold?: number;
  maxTimeout?: number;
}

interface SwipeData {
  left: number;
  right: number;
  up: number;
  down: number;
}

interface PointerGestureSwipeEvent {
  swipeData: SwipeData;
  mainPointerData: PointerData;
}

export class PointerSwipeGesture extends PointerGesture {
  #threshold: number;
  #maxTimeout: number;

  constructor(
    element?: HTMLElement,
    settings: PointerSwipeGestureSettings = {}
  ) {
    super(element, settings);
    this.#threshold = settings.threshold ?? 100;
    this.#maxTimeout = settings.maxTimeout ?? 1000;
  }

  _handleGestureEnd(e: PointerEvent): void {
    if (this._mainPointerData === undefined || this.#wasSwipeTooSlow()) {
      return;
    }

    const threshold = this.#threshold;
    const swipeData: SwipeData = {
      left: 1,
      right: 1,
      up: 1,
      down: 1,
    };

    Array.from(this._pointersDataMap.values()).forEach((pointerData) => {
      const [lastPoint] = pointerData.coordinatesHistory.slice(-1);
      swipeData.left *= lastPoint.distanceX < threshold * -1 ? 1 : 0;
      swipeData.right *= lastPoint.distanceX > threshold ? 1 : 0;
      swipeData.up *= lastPoint.distanceX < threshold * -1 ? 1 : 0;
      swipeData.down *= lastPoint.distanceY > threshold ? 1 : 0;
    });

    let key: keyof SwipeData;
    for (key in swipeData) {
      const value = swipeData[key];

      if (value) {
        this._element.dispatchEvent(new Event(`pointer-gesture-swipe-${key}`));
      }
    }

    const event = new CustomEvent<PointerGestureSwipeEvent>(
      "pointer-gesture-swipe",
      {
        detail: {
          swipeData,
          mainPointerData: this._mainPointerData,
        },
      }
    );
    this._element.dispatchEvent(event);
  }

  #wasSwipeTooSlow() {
    if (this._mainPointerData === undefined) {
      return true;
    }

    const { coordinatesHistory } = this._mainPointerData;
    const startDate = coordinatesHistory[0].timestamp;

    return Date.now() - startDate > this.#maxTimeout;
  }
}
