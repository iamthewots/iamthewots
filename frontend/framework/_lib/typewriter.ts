interface ActionSettings {
  id: number;
  actionName: ActionName;
}

type ActionName =
  | "writeText"
  | "delete"
  | "deleteAll"
  | "skip"
  | "skipAll"
  | "pause"
  | "setSpeed";

interface WriteTextSettings extends ActionSettings {
  actionName: "writeText";
  text: string;
  wrapperElement?: Element;
}

interface DeleteSettings extends ActionSettings {
  actionName: "delete";
  charsCount: number;
}

interface DeleteAllSettings extends ActionSettings {
  actionName: "deleteAll";
}

interface SkipSettings extends ActionSettings {
  actionName: "skip";
}

export class Typewriter {
  #baseTimeout: number;
  #timeoutMultiplier = 1;
  #actionsQueue: ActionSettings[] = [];
  #isActive = false;

  constructor(baseSpeed: number = 10) {
    this.#baseTimeout = Math.max(baseSpeed, 10);
  }

  writeText(text: string, wrapperElement?: Element) {
    return this;
  }

  deleteText(charsCount: number) {
    return this;
  }

  deleteAll() {
    return this;
  }

  skip(actionSettingsId?: number) {
    return this;
  }

  pause(timeout: number) {
    return this;
  }

  setSpeedMultiplier(speedMultiplier: number) {
    return this;
  }

  start() {
    this.#isActive = true;
    this.#executeActions();
  }

  stop() {
    this.#isActive = false;
  }

  async #executeActions() {
    while (this.#actionsQueue.length > 0 && this.#isActive === true) {
      const actionSettings = this.#actionsQueue[0];
      const timeout = this.#baseTimeout * this.#timeoutMultiplier;

      await new Promise((resolve) => {
        let intervalId = window.setInterval(() => {
          if (this.#isActive === false) {
            window.clearInterval(intervalId);
            return resolve(null);
          }

          switch (actionSettings.actionName) {
          }
        }, timeout);
      });
    }
  }

  #getActionSettingsId() {}
}
