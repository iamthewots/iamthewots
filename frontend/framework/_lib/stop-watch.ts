type Callback = (...args: any[]) => any;

interface StopWatchLogEntry {
  timestamp: number;
  description: "start" | "stop" | "reset" | "adjust" | "set";
  detail: number;
}

export class StopWatch {
  #callbacksMap: Map<number, { callback: Callback; executeOnce: boolean }> =
    new Map();
  #intervalId: number | undefined;
  #timeout = 100;
  #elapsedTime = 0;
  #eventsLog: StopWatchLogEntry[] = [];

  constructor() {}

  setCallback(timePoint: number, callback: Callback, executeOnce = true) {
    if (timePoint < 0) {
      throw new Error("invalid_time_point");
    }

    timePoint = this.#roundTime(timePoint);
    this.#callbacksMap.set(timePoint, { callback, executeOnce });
  }

  start() {
    this.#intervalId = window.setInterval(() => {
      this.#handleTimeoutEndEvent();
    }, this.#timeout);

    this.#eventsLog.push({
      timestamp: Date.now(),
      description: "start",
      detail: this.#elapsedTime,
    });
  }

  stop() {
    this.#eventsLog.push({
      timestamp: Date.now(),
      description: "stop",
      detail: this.#elapsedTime,
    });
    window.clearInterval(this.#intervalId);
  }

  reset() {
    this.#elapsedTime = 0;

    this.#eventsLog.push({
      timestamp: Date.now(),
      description: "reset",
      detail: 0,
    });
  }

  adjustTime(timeAdjustment: number) {
    timeAdjustment =
      Math.sign(timeAdjustment) * Math.abs(this.#roundTime(timeAdjustment));
    this.#elapsedTime += timeAdjustment;

    this.#eventsLog.push({
      timestamp: Date.now(),
      description: "adjust",
      detail: timeAdjustment,
    });
  }

  setTime(time: number) {
    time = this.#roundTime(time);
    this.#elapsedTime = this.#roundTime(time);

    this.#eventsLog.push({
      timestamp: Date.now(),
      description: "set",
      detail: this.#elapsedTime,
    });
  }

  #handleTimeoutEndEvent() {
    this.#elapsedTime += this.#timeout;
    const timePointData = this.#callbacksMap.get(this.#elapsedTime);

    if (timePointData === undefined) {
      return;
    }

    const { callback, executeOnce } = timePointData;
    callback();

    if (executeOnce) {
      this.#callbacksMap.delete(this.#elapsedTime);
    }
  }

  #roundTime(time: number) {
    if (time < 0) {
      return 0;
    }

    const remainder = time % this.#timeout;
    const roundedTime =
      time - remainder + (remainder > this.#timeout ? this.#timeout : 0);

    return roundedTime;
  }

  get eventsLog() {
    return this.#eventsLog;
  }
}
