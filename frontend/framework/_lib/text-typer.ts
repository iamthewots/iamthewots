enum ActionId {
  "WriteText",
  "DeleteText",
  "PauseText",
  "ChangeOutputElement",
  "ChangeTimeoutMultiplier",
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

interface ChangeTimeoutMultiplierAction {
  actionId: ActionId.ChangeTimeoutMultiplier;
  multiplier: number;
}

interface SetCheckpointAction {
  actionId: ActionId.SetCheckpoint;
  checkpointId: string;
}

export type TextTyperAction =
  | WriteTextAction
  | DeleteTextAction
  | PauseTextAction
  | ChangeTimeoutMultiplierAction
  | SetCheckpointAction;

export class TextTyper {
  #outputElement: HTMLElement;
  #baseTimeout: number;
  #timeoutMultiplier = 1;
  #queue: TextTyperAction[] = [];
  #checkpoints: Map<string, string> = new Map();

  constructor(outputElement: HTMLElement, baseTimeout = 10) {
    this.#outputElement = outputElement;
    this.#baseTimeout = Math.max(baseTimeout, 10);
  }

  startTyping() {}

  stopTyping() {}

  skipTyping(checkpointId?: string) {}

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
      timeout: Math.max(timeout, this.#baseTimeout),
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

  async #executeQueueActions() {}

  async #executeWriteTextAction(settings: WriteTextAction) {
    if (settings.text.length === 0) {
      return true;
    }

    const char = settings.text[0];
    settings.wrapperElement.innerText += char;
    settings.text = settings.text.slice(1);

    return settings.text.length === 0;
  }

  async #executeDeleteTextAction(settings: DeleteTextAction) {
    const length = this.#outputElement.children.length;

    if (length === 0 || settings.charsCount === 0) {
      return true;
    }


    // ciclo while (o for con un bel break) per trovare un figlio stronzo con del testo
    // se il ciclo finisce, si restituisce un bel true coi controcazzi
    // tranciare un carattere fino a zero
    // se charsCount indefinito, restituire sempre false, tanto esce true, in caso, al primo controllo
    // sennò diminuire charsCount e se esce 0, si restituisce true
  }

  async #executePauseTextAction({ timeout }: PauseTextAction) {}

  async #executeSetCheckpointAction({ checkpointId }: SetCheckpointAction) {}
}
