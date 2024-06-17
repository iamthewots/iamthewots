type ActionName =
  | "writeText"
  | "delete"
  | "deleteAll"
  | "skip"
  | "skipAll"
  | "pause"
  | "setSpeed";

interface WriteTextSettings {
  id: number;
  actionName: "writeText";
  text: string;
  wrapperElement?: Element;
}

interface DeleteSettings {
  id: number;
  actionName: "delete";
  charsCount: number;
}

interface DeleteAllSettings {
  id: number;
  actionName: "deleteAll";
}

interface SkipSettings {
  id: number;
  actionName: "skip";
}

type ActionSettings =
  | WriteTextSettings
  | DeleteSettings
  | DeleteAllSettings
  | SkipSettings;

export class Typewriter {
  #outputElement: HTMLElement;
  #baseTimeout: number;
  #timeoutMultiplier = 1;
  #actionsQueue: ActionSettings[] = [];
  #isActive = false;

  constructor(outputElement: HTMLElement, baseSpeed: number = 10) {
    this.#outputElement = outputElement;
    this.#baseTimeout = Math.max(baseSpeed, 10);
  }

  changeOutputElement(element: HTMLElement) {
    if (element instanceof HTMLElement === false) {
      return;
    }

    this.#outputElement = element;
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
    if (this.#isActive === true) {
      return;
    } else if (this.#outputElement === null) {
      throw new Error("output_element_not_provided");
    }

    this.#isActive = true;
    this.#executeActions();
  }

  stop() {
    if (this.#isActive === false) {
      return;
    }

    this.#isActive = false;
  }

  async #executeActions() {
    while (this.#actionsQueue.length > 0 && this.#isActive === true) {
      const actionSettings = this.#actionsQueue[0];
      const timeout = this.#baseTimeout * this.#timeoutMultiplier;
      let intervalId: number;

      await new Promise((resolve) => {
        let actionComplete = false;

        intervalId = window.setInterval(() => {
          if (this.#isActive === false || actionComplete) {
            window.clearInterval(intervalId);
            return resolve(null);
          }

          switch (actionSettings.actionName) {
            case "writeText":
              if (actionSettings.text.length === 0) {
                return resolve(null);
              }

              const char = actionSettings.text[0];
              this.#outputElement.innerText += char;
              break;
          }
        }, timeout);

        window.clearInterval(intervalId);
      });
    }
  }

  #getActionSettingsId() {}
}
