enum ActionId {
  "WriteText",
  "DeleteText",
  "AddPause",
  "ChangeElement",
  "ChangeTimeout",
  "SetCheckpoint",
  "SetCallback",
}

interface WriteTextAction {
  actionId: ActionId.WriteText;
  text: string;
  wrapperElement: HTMLElement;
}

interface DeleteTextAction {
  actionId: ActionId.DeleteText;
  charsCount?: number;
}

interface AddPauseAction {
  actionId: ActionId.AddPause;
  timeout: number;
}

interface ChangeElementAction {
  actionId: ActionId.ChangeElement;
  element: HTMLElement;
}

interface ChangeTimeoutAction {
  actionId: ActionId.ChangeTimeout;
  timeout: number;
}

interface SetCheckpointAction {
  actionId: ActionId.SetCheckpoint;
  checkpointId: string;
}

interface SetCallbackAction {
  actionId: ActionId.SetCallback;
  callback: Callback;
}

type TextTyperAction =
  | WriteTextAction
  | DeleteTextAction
  | AddPauseAction
  | ChangeElementAction
  | ChangeTimeoutAction
  | SetCheckpointAction
  | SetCallbackAction;

type Callback = (...args: any[]) => any;

export class TextTyper {
  #element: HTMLElement;
  #timeout: number;
  #punctuationTimeoutMultiplier = 1;
  #deleteTimeoutMultiplier = 1;
  #queue: TextTyperAction[] = [];
  #handleQueueEndEvent?: Callback;
  #isActive = false;
  #skipQueue = false;
  #currentTimeoutPromiseResolve?: (value: unknown) => void;
  #checkpointsMap: Map<string, string> = new Map();

  constructor(element: HTMLElement, timeout = 10) {
    this.#element = element;
    this.#element.style.whiteSpace = "pre-wrap";
    this.#timeout = Math.max(timeout, 1);
  }

  start() {
    if (this.#isActive === true || this.#queue.length === 0) {
      return false;
    }

    this.#isActive = true;
    this.#runQueue();

    return true;
  }

  stop() {
    if (this.#isActive === false) {
      return false;
    }

    this.#isActive = false;

    return true;
  }

  skip() {
    if (this.#isActive === false) {
      return false;
    }

    this.#skipQueue = true;
    this.#currentTimeoutPromiseResolve?.(true);

    return true;
  }

  clear() {
    this.#element.innerHTML = "";

    return true;
  }

  restore(checkpointId: string) {
    const innerHTML = this.#checkpointsMap.get(checkpointId);

    if (innerHTML === undefined) {
      return false;
    }

    this.#element.innerHTML = innerHTML;
  }

  writeText(
    text: string,
    wrapperElement?: HTMLElement | keyof HTMLElementTagNameMap,
    ...classNames: string[]
  ) {
    this.#queue.push({
      actionId: ActionId.WriteText,
      text,
      wrapperElement: this.#parseWrapperElement(wrapperElement, ...classNames),
    });

    return this;
  }

  spellText(
    text: string,
    wrapperElement?: HTMLElement | keyof HTMLElementTagNameMap,
    ...classNames: string[]
  ) {
    for (let i = 0; i < text.length; i++) {
      this.writeText(text[i], wrapperElement, ...classNames);
    }

    return this;
  }

  #parseWrapperElement(
    value?: HTMLElement | keyof HTMLElementTagNameMap,
    ...classNames: string[]
  ) {
    if (value === undefined) {
      return document.createElement("span");
    }

    const wrapperElement =
      value instanceof HTMLElement
        ? value
        : document.createElement(value.toString());

    classNames.forEach((className) => wrapperElement.classList.add(className));

    return wrapperElement;
  }

  addLineBreak() {
    this.#queue.push({
      actionId: ActionId.WriteText,
      text: "",
      wrapperElement: document.createElement("br"),
    });

    return this;
  }

  deleteText(charsCount?: number) {
    this.#queue.push({
      actionId: ActionId.DeleteText,
      charsCount,
    });

    return this;
  }

  addPause(timeout: number) {
    this.#queue.push({
      actionId: ActionId.AddPause,
      timeout,
    });

    return this;
  }

  changeElement(element: HTMLElement) {
    this.#queue.push({
      actionId: ActionId.ChangeElement,
      element,
    });

    return this;
  }

  changeTimeout(timeout: number) {
    this.#queue.push({
      actionId: ActionId.ChangeTimeout,
      timeout,
    });

    return this;
  }

  setCheckpoint(checkpointId: string) {
    this.#queue.push({
      actionId: ActionId.SetCheckpoint,
      checkpointId,
    });

    return this;
  }

  setCallback(callback: Callback) {
    this.#queue.push({
      actionId: ActionId.SetCallback,
      callback,
    });

    return this;
  }

  async #runQueue() {
    while (this.#queue.length > 0 && this.#isActive) {
      const settings = this.#queue[0];

      if (settings.actionId === ActionId.WriteText) {
        const { wrapperElement } = settings;

        if (this.#element.contains(wrapperElement) === false) {
          this.#element.appendChild(wrapperElement);
        }
      }

      let actionWasCompleted = false;

      while (actionWasCompleted === false && this.#isActive) {
        switch (settings.actionId) {
          case ActionId.WriteText:
            actionWasCompleted = await this.#executeWriteTextAction(settings);
            break;
          case ActionId.DeleteText:
            actionWasCompleted = await this.#executeDeleteTextAction(settings);
            break;
          case ActionId.AddPause:
            actionWasCompleted = await this.#executeAddPauseAction(settings);
            break;
          case ActionId.ChangeElement:
            actionWasCompleted = await this.#executeChangeElementAction(
              settings
            );
            break;
          case ActionId.ChangeTimeout:
            actionWasCompleted = await this.#executeChangeTimeoutAction(
              settings
            );
            break;
          case ActionId.SetCheckpoint:
            actionWasCompleted = await this.#executeSetCheckpointAction(
              settings
            );
            break;
          case ActionId.SetCallback:
            actionWasCompleted = await this.#executeSetCallbackAction(settings);
            break;
          default:
            actionWasCompleted = true;
        }

        if (actionWasCompleted) {
          this.#queue.shift();
        }
      }

      if (this.#queue.length === 0) {
        this.#isActive = false;
        this.#skipQueue = false;
      }
    }

    if (this.#queue.length === 0 && this.#handleQueueEndEvent !== undefined) {
      this.#handleQueueEndEvent();
    }
  }

  async #executeWriteTextAction(settings: WriteTextAction) {
    if (settings.text.length === 0) {
      return true;
    } else if (this.#skipQueue) {
      settings.wrapperElement.textContent += settings.text;

      return true;
    }

    const char = settings.text[0];
    const timeoutMultiplier =
      ",;.:!?".indexOf(char) !== -1 ? this.#punctuationTimeoutMultiplier : 1;
    settings.wrapperElement.textContent += settings.text[0];
    settings.text = settings.text.substring(1);
    await this.#timeoutPromise(this.#timeout * timeoutMultiplier);

    return settings.text.length === 0;
  }

  async #executeDeleteTextAction(settings: DeleteTextAction) {
    if (this.#element.children.length === 0 || settings.charsCount === 0) {
      return true;
    }

    let childElement: HTMLElement | undefined;

    for (let i = this.#element.children.length - 1; i > 0; i--) {
      const element = this.#element.children[i];

      if (element instanceof HTMLElement === false) {
        continue;
      } else if (element.innerText.length === 0) {
        element.parentElement?.removeChild(element);

        continue;
      }

      if (this.#skipQueue) {
        if (typeof settings.charsCount !== "number") {
          element.parentElement?.removeChild(element);
        } else {
          if (element.innerText.length < settings.charsCount) {
            settings.charsCount -= element.innerText.length;
            element.parentElement?.removeChild(element);
          } else if (element.innerText.length === settings.charsCount) {
            element.parentElement?.removeChild(element);

            return true;
          } else {
            element.innerText.slice(0, -1 * settings.charsCount);

            return true;
          }
        }
      } else {
        childElement = element;

        break;
      }
    }

    if (childElement === undefined) {
      return true;
    }

    await this.#timeoutPromise(this.#timeout * this.#deleteTimeoutMultiplier);
    childElement.innerText = childElement.innerText.slice(0, -1);

    if (typeof settings.charsCount === "number") {
      settings.charsCount--;
    }

    return settings.charsCount === 0;
  }

  async #executeAddPauseAction(settings: AddPauseAction) {
    if (this.#skipQueue) {
      return true;
    }

    await this.#timeoutPromise(settings.timeout);

    return true;
  }

  async #executeChangeElementAction(settings: ChangeElementAction) {
    this.#element = settings.element;
    this.#element.style.whiteSpace = "pre-wrap";

    return true;
  }

  async #executeChangeTimeoutAction(settings: ChangeTimeoutAction) {
    this.#timeout = Math.max(settings.timeout, 1);

    return true;
  }

  async #executeSetCheckpointAction(settings: SetCheckpointAction) {
    this.#checkpointsMap.set(settings.checkpointId, this.#element.innerHTML);

    return true;
  }

  async #executeSetCallbackAction(settings: SetCallbackAction) {
    settings.callback();

    return true;
  }

  async #timeoutPromise(timeout = this.#timeout) {
    return new Promise((resolve) => {
      this.#currentTimeoutPromiseResolve = resolve;
      window.setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  get punctuationTimeoutMultiplier() {
    return this.#punctuationTimeoutMultiplier;
  }

  set punctuationTimeoutMultiplier(value: number) {
    this.#punctuationTimeoutMultiplier = Math.max(value, 1);
  }

  get deleteTimeoutMultiplier() {
    return this.#deleteTimeoutMultiplier;
  }

  set deleteTimeoutMultiplier(value: number) {
    this.#deleteTimeoutMultiplier = Math.max(value, 1);
  }

  set handleQueueEndEvent(value: Callback) {
    this.#handleQueueEndEvent = value;
  }

  get queueLength() {
    return this.#queue.length;
  }
}
