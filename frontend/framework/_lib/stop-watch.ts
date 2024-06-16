type CallbackFunction = (...args: any[]) => unknown;

export class StopWatch {
  #callbacksMap: Map<number, CallbackFunction> = new Map();
  #timeout = 100;
  #totalTime = 0;

  constructor(timeout?: number) {
    this.#timeout = timeout ?? this.#timeout;
  }

  start() {}

  pause() {}

  addTimePointCallback(timePoint: number, callback: CallbackFunction) {}

  #handleCycleEnd() {
    this.#totalTime += this.#timeout;
  }

  get timeout() {
    return this.#timeout;
  }
}
