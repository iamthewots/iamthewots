enum ActionId {
  "WriteText",
  "DeleteText",
  "PauseText",
  "ChangeOutputElement",
  "ChangeTimeout",
  "SetCheckpoint",
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

interface PauseTextAction {
  actionId: ActionId.PauseText;
  timeout: number;
}

interface ChangeTimeoutAction {
  actionId: ActionId.ChangeTimeout;
  timeout: number;
}

interface SetCheckpointAction {
  actionId: ActionId.SetCheckpoint;
  checkpointId: string;
}

export type TextTyperAction =
  | WriteTextAction
  | DeleteTextAction
  | PauseTextAction
  | ChangeTimeoutAction
  | SetCheckpointAction;

export class TextTyper {
  #outputElement: HTMLElement;
  #timeout: number;
  #queue: TextTyperAction[] = [];
  #isActive = false;
  #mustSkip = false;
  #checkpoints: Map<string, string> = new Map();

  constructor(outputElement: HTMLElement, baseTimeout = 10) {
    this.#outputElement = outputElement;
    this.#timeout = Math.max(baseTimeout, 10);
  }

  startTyping() {
    this.#isActive = true;
    this.#executeQueueActions();
  }

  stopTyping() {
    this.#isActive = false;
  }

  skipTyping(checkpointId?: string) {
    if (this.#isActive === false) {
      return;
    }

    this.#mustSkip = true;
  }

  writeText(text: string, wrapperElement?: HTMLElement) {
    this.#queue.push({
      actionId: ActionId.WriteText,
      text,
      wrapperElement: wrapperElement ?? document.createElement("span"),
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

  pauseText(timeout: number) {
    this.#queue.push({
      actionId: ActionId.PauseText,
      timeout: Math.max(timeout, this.#timeout),
    });

    return this;
  }

  changeTimeout(timeout = 10) {
    this.#queue.push({
      actionId: ActionId.ChangeTimeout,
      timeout: Math.max(timeout, 10),
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

  async #executeQueueActions() {
    while (this.#queue.length > 0 && this.#isActive) {
      const actionSettings = this.#queue[0];

      if (actionSettings.actionId === ActionId.WriteText) {
        const { wrapperElement } = actionSettings;

        if (this.#outputElement.contains(wrapperElement) === false) {
          this.#outputElement.appendChild(actionSettings.wrapperElement);
        }
      }

      let actionIsComplete = false;

      while (actionIsComplete === false && this.#isActive) {
        switch (actionSettings.actionId) {
          case ActionId.WriteText:
            actionIsComplete = await this.#executeWriteTextAction(
              actionSettings
            );
            break;
          case ActionId.DeleteText:
            actionIsComplete = await this.#executeDeleteTextAction(
              actionSettings
            );
            break;
          case ActionId.PauseText:
            actionIsComplete = await this.#executePauseTextAction(
              actionSettings
            );
            break;
          case ActionId.ChangeTimeout:
            actionIsComplete = await this.#executeChangeTimeoutAction(
              actionSettings
            );
            break;
          case ActionId.SetCheckpoint:
            actionIsComplete = await this.#executeSetCheckpointAction(
              actionSettings
            );
            break;
        }

        if (actionIsComplete) {
          this.#queue.shift();
        }
      }
    }

    if (this.#queue.length === 0) {
      this.#isActive = false;
    }
  }

  async #executeWriteTextAction(settings: WriteTextAction) {
    if (settings.text.length === 0) {
      return true;
    }

    if (this.#mustSkip) {
      settings.wrapperElement.textContent += settings.text;

      return true;
    }

    await new Promise((resolve) => {
      window.setTimeout(() => {
        settings.wrapperElement.textContent += settings.text[0];

        resolve(true);
      }, this.#timeout);
    });

    settings.text = settings.text.substring(1);

    return settings.text.length === 0;
  }

  async #executeDeleteTextAction(settings: DeleteTextAction) {
    if (
      this.#outputElement.children.length === 0 ||
      settings.charsCount === 0
    ) {
      return true;
    }

    let childElement: HTMLElement | undefined;

    for (let i = this.#outputElement.children.length - 1; i > 0; i--) {
      const element = this.#outputElement.children[i];

      if (element instanceof HTMLElement === false) {
        continue;
      } else if (element.innerText.length === 0) {
        this.#outputElement.removeChild(element);

        continue;
      }

      if (this.#mustSkip) {
        if (typeof settings.charsCount !== "number") {
          this.#outputElement.removeChild(element);
        } else {
          if (element.innerText.length < settings.charsCount) {
            settings.charsCount -= element.innerText.length;
            this.#outputElement.removeChild(element);
          } else if (element.innerText.length === settings.charsCount) {
            this.#outputElement.removeChild(element);

            return true;
          } else {
            element.innerText.slice(0, -1 * settings.charsCount);

            return true;
          }
        }

        continue;
      } else {
        childElement = element;
        break;
      }
    }

    if (childElement === undefined) {
      return true;
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        childElement.innerText = childElement.innerText.slice(0, -1);

        resolve(true);
      }, this.#timeout);
    });

    if (typeof settings.charsCount === "number") {
      settings.charsCount--;
    }

    return settings.charsCount === 0;
  }

  async #executePauseTextAction(settings: PauseTextAction) {
    if (this.#mustSkip) {
      return true;
    }

    await new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(true);
      }, 100);
    });

    settings.timeout -= 100;

    return settings.timeout <= 0;
  }

  async #executeChangeTimeoutAction({ timeout }: ChangeTimeoutAction) {
    this.#timeout = timeout;

    return true;
  }

  async #executeSetCheckpointAction({ checkpointId }: SetCheckpointAction) {
    this.#checkpoints.set(checkpointId, this.#outputElement.innerHTML);

    return true;
  }
}
