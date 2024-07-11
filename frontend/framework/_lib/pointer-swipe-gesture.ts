import {
  PointerGesture,
  type PointerData,
  type PointerGestureSettings,
} from "./pointer-gesture";

export interface PointerSwipeGestureSettings extends PointerGestureSettings {
  minLength?: number;
  maxTimeout?: number;
  swipeDetection?: SwipeDetection;
}

type SwipeDetection = "flex" | "strict";

type SwipeDirection = (typeof swipeDirections)[number];

type SwipeFailMessage =
  | "exceeded_max_timeout"
  | "invalid_swipe_length"
  | "uneven_swipe";

const swipeDirections = ["left", "right", "up", "down"] as const;

export class PointerSwipeGesture extends PointerGesture {
  _minWidthMultiplier = 0.5;
  _minHeightMultiplier = 0.5;
  #minLength: number;
  #maxTimeout: number;
  #swipeDetection: SwipeDetection;

  constructor(
    element: HTMLElement,
    settings: PointerSwipeGestureSettings = {}
  ) {
    super(element, settings);
    this.#minLength = settings.minLength ?? 100;
    this.#maxTimeout = settings.maxTimeout ?? 1000;
    this.#swipeDetection = settings.swipeDetection ?? "strict";
  }

  _handleGestureEnd(e: PointerEvent): void {
    const minLengths = this.#parseMinLength();
    let highestTiming = 0;
    const swipeDirectionsDetected: Set<SwipeDirection> = new Set();

    this._pointersDataMap.forEach((pointerData) => {
      const swipeTiming = this.#getSwipeTiming(pointerData);
      const swipeDirections = this.#getSwipeDirection(pointerData, minLengths);

      if (swipeTiming > highestTiming) {
        highestTiming = swipeTiming;
      }

      swipeDirections.forEach((direction) => {
        swipeDirectionsDetected.add(direction);
      });
    });

    let failMessage: SwipeFailMessage | undefined;

    if (highestTiming > this.#maxTimeout) {
      failMessage = "exceeded_max_timeout";
    } else if (swipeDirectionsDetected.size === 0) {
      failMessage = "invalid_swipe_length";
    } else if (
      swipeDirectionsDetected.size > 1 &&
      this.#swipeDetection === "strict"
    ) {
      failMessage = "uneven_swipe";
    }

    if (failMessage !== undefined) {
      const event = new CustomEvent("pointer-swipe-fail", {
        detail: {
          message: failMessage,
        },
      });
      this._element.dispatchEvent(event);

      return;
    }

    Array.from(swipeDirectionsDetected).forEach((swipeDirection) => {
      console.log(swipeDirection);
      const event = new Event(`pointer-swipe-${swipeDirection}`);
      console.log(event.type);
      this._element.dispatchEvent(event);
    });
  }

  #getSwipeTiming(pointerData: PointerData) {
    const [firstPoint] = pointerData.points;
    const [lastPoint] = pointerData.points.slice(-1);

    return lastPoint.timestamp - firstPoint.timestamp;
  }

  #parseMinLength() {
    const { width, height } = this._element.getBoundingClientRect();

    return {
      x: Math.min(width * this._minWidthMultiplier, this.#minLength),
      y: Math.min(height * this._minHeightMultiplier, this.#minLength),
    };
  }

  #getSwipeDirection(
    pointerData: PointerData,
    minDistanceData: { x: number; y: number }
  ) {
    const swipeDirections: SwipeDirection[] = [];
    const [lastPoint] = pointerData.points.slice(-1);

    if (lastPoint.deltaX <= minDistanceData.x * -1) {
      swipeDirections.push("left");
    }

    if (lastPoint.deltaX >= minDistanceData.x) {
      swipeDirections.push("right");
    }

    if (lastPoint.deltaY <= minDistanceData.y * -1) {
      swipeDirections.push("up");
    }

    if (lastPoint.deltaY >= minDistanceData.y) {
      swipeDirections.push("down");
    }

    return swipeDirections;
  }
}
