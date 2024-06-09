import { BrowserStorage, type BrowserStorageType } from "@_lib/browser-storage";
import type { VueEmits } from "@_vue/types";
import type { Ref } from "vue";

export interface InputToolsProps {
  storageId: string;
  storageType: BrowserStorageType;
  enableAutosave: boolean;
  autosaveInterval: number;
}

export interface InputToolsEmits<P extends string> {
  (e: `${P}clear-input-value`): void;
  (e: `${P}save-input-value`, saveData: SaveData): void;
  (e: `${P}autosave-input-value`, saveData: SaveData): void;
  (e: `${P}restore-input-value`, saveData: SaveData): void;
  (e: `${P}enable-autosave`, autosaveRawKey: string): void;
  (e: `${P}disable-autosave`, autosaveRawKey: string): void;
}

export interface InputToolsSettings {
  inputElement: Ref<InputToolsElement | null>;
  emits: VueEmits;
  emitsPrefix: string;
  storageId?: string;
  storageType?: BrowserStorageType;
}

export interface InputTools {
  browserStorage: BrowserStorage<SaveData> | undefined;
  clearValue: () => void;
  saveValue: (rawKey: string) => void;
  restoreValue: (rawKey: string) => void;
  enableAutosave: (rawKey: string, autosaveInterval: number) => void;
  disableAutosave: () => void;
}

type InputToolsElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface SaveData {
  value: string;
  timestamp: number;
}

export function useInputTools(settings: InputToolsSettings): InputTools {
  let browserStorage: BrowserStorage<SaveData> | undefined;
  let autosaveRawKey = "";
  let autosaveIntervalId: number;

  try {
    const { storageId, storageType } = settings;

    if (typeof storageId !== "string") {
      throw new Error("missing_storage_id");
    } else if (typeof storageType != "string") {
      throw new Error("missing_storage_type");
    }

    browserStorage = new BrowserStorage<SaveData>(storageId, storageType);
  } catch (error) {
    console.log("Browser storage is not available.");
  }

  function clearValue() {
    const { inputElement, emits, emitsPrefix } = settings;

    if (isInputElementAvailable(inputElement) === false) {
      return;
    }

    inputElement.value.value = "";
    inputElement.value.dispatchEvent(new Event("input"));
    emits(`${emitsPrefix}clear-value`);
  }

  function saveValue(rawKey: string) {
    const { inputElement, emits, emitsPrefix } = settings;

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
    emits(`${emitsPrefix}save-value`, saveData);
  }

  function restoreValue(rawKey: string) {
    const { inputElement, emits, emitsPrefix } = settings;

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
    emits(`${emitsPrefix}restore-value`, saveData);
  }

  function enableAutosave(rawKey: string, autosaveInterval: number) {
    if (isBrowserStorageAvailable(browserStorage) === false) {
      return;
    }

    const { emits, emitsPrefix } = settings;
    autosaveRawKey = rawKey;
    emits(`${emitsPrefix}enable-autosave`, autosaveRawKey);
    autosaveIntervalId = window.setInterval(() => {
      saveValue(rawKey);
    }, autosaveInterval);
  }

  function disableAutosave() {
    if (autosaveIntervalId === undefined) {
      return;
    }

    const { emits, emitsPrefix } = settings;
    window.clearInterval(autosaveIntervalId);
    emits(`${emitsPrefix}disable-autosave`, autosaveRawKey);
    autosaveRawKey = "";
  }

  function isInputElementAvailable(
    inputElement: Ref<InputToolsElement | null>
  ): inputElement is Ref<InputToolsElement> {
    return inputElement.value !== null;
  }

  function isBrowserStorageAvailable(
    browserStorage: BrowserStorage<SaveData> | undefined
  ): browserStorage is BrowserStorage {
    return browserStorage !== undefined;
  }

  return {
    browserStorage,
    clearValue,
    saveValue,
    restoreValue,
    enableAutosave,
    disableAutosave,
  };
}
