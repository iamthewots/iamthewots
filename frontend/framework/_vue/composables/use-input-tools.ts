import type { VueEmits } from "@_vue/types";
import type { Ref } from "vue";
import { BrowserStorage, type BrowserStorageType } from "@_lib/browser-storage";

type InputToolsElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface SaveData {
  value: string;
  timestamp: number;
}

export interface InputToolsProps {
  storageId?: string;
  storageType?: BrowserStorageType;
  enableAutosave?: boolean;
  autosaveInterval?: number;
}

export interface InputToolsEmits<P extends string> {
  (e: `${P}clear-input-value`): void;
  (e: `${P}save-input-value`, payload: SaveData): void;
  (e: `${P}autosave-input-value`, payload: SaveData): void;
  (e: `${P}restore-input-value`, payload: SaveData): void;
  (e: `${P}enable-autosave`, payload: string): void;
  (e: `${P}disable-autosave`, payload: string): void;
}

export interface InputToolsSettings {
  inputElement: Ref<InputToolsElement | null>;
  emits: VueEmits;
  emitsEventPrefix: string;
  storageId: string;
  storageType: BrowserStorageType;
}

export interface InputTools {
  browserStorage: BrowserStorage | undefined;
  clearInputValue: () => void;
  saveInputValue: (rawKey: string) => SaveData | undefined;
  restoreInputValue: (rawKey: string) => SaveData | undefined;
  enableAutosave: (rawKey: string, autosaveInterval: number) => void;
  disableAutosave: () => void;
}

export function useInputTools(settings: InputToolsSettings): InputTools {
  let browserStorage: BrowserStorage<SaveData> | undefined;
  let autosaveRawKey = "";
  let autosaveIntervalId: number | undefined;

  try {
    browserStorage = new BrowserStorage<SaveData>(
      settings.storageId,
      settings.storageType
    );
  } catch (error) {
    console.log("Browser storage is not available.");
  }

  function clearInputValue() {
    const { inputElement, emits, emitsEventPrefix } = settings;

    if (isInputElementAvailable(inputElement) === false) {
      return;
    }

    inputElement.value.value = "";
    inputElement.value.dispatchEvent(new Event("input"));
    emits(`${emitsEventPrefix}clear-input-value`);
  }

  function saveInputValue(rawKey: string) {
    const { inputElement, emits, emitsEventPrefix } = settings;

    if (
      isInputElementAvailable(inputElement) === false ||
      isBrowserStorageAvailable(browserStorage) === false
    ) {
      return;
    }

    const saveData: SaveData = {
      value: inputElement.value.value,
      timestamp: Date.now(),
    };
    browserStorage.setItem(rawKey, saveData);
    emits(`${emitsEventPrefix}save-input-value`, saveData);

    if (rawKey === autosaveRawKey) {
      emits(`${emitsEventPrefix}autosave-input-value`, saveData);
    }

    return saveData;
  }

  function restoreInputValue(rawKey: string) {
    const { inputElement, emits, emitsEventPrefix } = settings;

    if (
      isInputElementAvailable(inputElement) === false ||
      isBrowserStorageAvailable(browserStorage) === false
    ) {
      return;
    }

    const saveData = browserStorage.getItem(rawKey);

    if (saveData === null) {
      return;
    }

    inputElement.value.value = saveData.value;
    emits(`${emitsEventPrefix}restore-input-value`, saveData);

    return saveData;
  }

  function enableAutosave(rawKey: string, autosaveInterval: number) {
    if (isBrowserStorageAvailable(browserStorage) === false) {
      return;
    }

    const { emits, emitsEventPrefix } = settings;
    autosaveRawKey = rawKey;
    emits(`${emitsEventPrefix}enable-autosave`, autosaveRawKey);
    autosaveIntervalId = window.setInterval(() => {
      saveInputValue(rawKey);
    }, autosaveInterval);
  }

  function disableAutosave() {
    if (autosaveIntervalId === undefined) {
      return;
    }

    const { emits, emitsEventPrefix } = settings;
    window.clearInterval(autosaveIntervalId);
    emits(`${emitsEventPrefix}disable-autosave`, autosaveRawKey);
    autosaveRawKey = "";
  }

  return {
    browserStorage,
    clearInputValue,
    saveInputValue,
    restoreInputValue,
    enableAutosave,
    disableAutosave,
  };
}

function isInputElementAvailable(
  inputElement: Ref<InputToolsElement | null>
): inputElement is Ref<InputToolsElement> {
  return inputElement.value !== null;
}

function isBrowserStorageAvailable(
  storage: BrowserStorage<SaveData> | undefined
): storage is BrowserStorage<SaveData> {
  return storage !== undefined;
}
