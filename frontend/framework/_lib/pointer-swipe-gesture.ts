import {
  PointerGesture,
  type PointerData,
  type PointerGestureSettings,
} from "./pointer-gesture";

export interface PointerSwipeGestureSettings extends PointerGestureSettings {
  minDistance?: number;
  maxTimeout?: number;
}

type SwipeDirection = (typeof swipeDirections)[number];

const swipeDirections = ["left", "right", "up", "down"] as const;

export class PointerSwipeGesture extends PointerGesture {
  #minDistance: number;
  #maxTimeout: number;

  constructor(
    element: HTMLElement,
    settings: PointerSwipeGestureSettings = {}
  ) {
    super(element, settings);
    this.#minDistance = settings.minDistance ?? 100;
    this.#maxTimeout = settings.maxTimeout ?? 1000;
  }

  _handleGestureEnd(e: PointerEvent): void {
    if (this.#isSwipeTimingValid() === false) {
      const event = new CustomEvent("swipe-fail", {
        detail: {
          message: "timing_not_valid",
        },
      });
      this._element.dispatchEvent(event);

      return;
    }

    const minDistanceData = this.#parseMinDistance();
    const detectedSwipes: Set<SwipeDirection> = new Set();

    this._pointersDataMap.forEach((pointerData) => {
      const swipeDirection = this.#getSwipeDirection(
        pointerData,
        minDistanceData
      );

      if (swipeDirection !== null) {
        detectedSwipes.add(swipeDirection);
      }
    });

    if (detectedSwipes.size > 1) {
      const event = new CustomEvent("swipe-fail", {
        detail: {
          message: "uneven_swipe",
        },
      });
      this._element.dispatchEvent(event);

      return;
    }

    const event = new Event(`swipe-${Array.from(detectedSwipes)[0]}`);
    this._element.dispatchEvent(event);
  }

  #parseMinDistance() {
    const { width, height } = this._element.getBoundingClientRect();

    return {
      x: Math.min(width, this.#minDistance),
      y: Math.min(height, this.#minDistance),
    };
  }

  #isSwipeTimingValid() {
    let swipeTimingIsValid = true;

    this._pointersDataMap.forEach((pointerData) => {
      if (swipeTimingIsValid === false) {
        return;
      }

      const [firstPoint] = pointerData.points;
      const [lastPoint] = pointerData.points.slice(-1);

      if (lastPoint.timestamp - firstPoint.timestamp > this.#maxTimeout) {
        swipeTimingIsValid = false;
      }
    });

    return swipeTimingIsValid;
  }

  #getSwipeDirection(
    pointerData: PointerData,
    minDistanceData: { x: number; y: number }
  ): SwipeDirection | null {
    const [lastPoint] = pointerData.points.slice(-1);
    const swipeAxis =
      Math.abs(lastPoint.deltaX) > Math.abs(lastPoint.deltaY) ? "x" : "y";

    if (swipeAxis === "x") {
      if (lastPoint.deltaX <= minDistanceData.x * -1) {
        return "left";
      } else if (lastPoint.deltaX >= minDistanceData.x) {
        return "right";
      }
    } else {
      if (lastPoint.deltaY <= minDistanceData.y * -1) {
        return "up";
      } else if (lastPoint.deltaY >= minDistanceData.y) {
        return "down";
      }
    }

    return null;
  }
}
