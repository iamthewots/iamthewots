import { PointerGesture, type PointerGestureSettings } from "./pointer-gesture";

export interface PointerSwipeGestureSettings extends PointerGestureSettings {
  minDistance?: number;
  maxTimeout?: number;
}

export class PointerSwipeGesture extends PointerGesture {
  #minDistance: number;
  #maxTimeout: number;

  constructor(element: HTMLElement, settings: PointerSwipeGestureSettings) {
    super(element, settings);
    const { minDistance, maxTimeout } = settings;
    this.#minDistance = minDistance ?? 100;
    this.#maxTimeout = maxTimeout ?? 1000;
  }

  handleGestureEnd(e: PointerEvent): void {
    if (this._mainPointerData === undefined) {
      return;
    }

    const pointersDataArray = Array.from(this._pointersDataMap.values());
    const currentDate = Date.now();
    const minDistance = Math.min(
      this.#minDistance,
      this._element.clientWidth,
      this._element.clientHeight
    );
    const swipeDirections = {
      left: true,
      right: true,
      up: true,
      down: true,
    };

    for (let i = 0; i < pointersDataArray.length; i++) {
      const pointerData = pointersDataArray[i];
      const { timestamp } = pointerData;

      if (currentDate - timestamp > this.#maxTimeout) {
        return;
      }
    }

    // if (
    //   this._mainPointerData === undefined ||
    //   this.#isSwipeTimingValid() === false
    // ) {
    //   this._element.dispatchEvent(new Event("pointer-gesture:swipe-fail"));
    //   return;
    // }
    // check all pointers for minimum distance
    // check all pointers for max timing
    // check all swipe values and only use the ones that get always true
  }
}
