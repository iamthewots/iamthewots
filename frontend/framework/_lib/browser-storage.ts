export type BrowserStorageType = "session" | "local";

export class BrowserStorage<T = any> {
  #storageId: string;
  #storageApi: Storage;

  constructor(storageId: string, storageType: BrowserStorageType) {
    if (storageId === "") {
      throw new Error("empty_storage_id");
    }

    this.#storageId = storageId.trim();

    if (BrowserStorage.isStorageEnabled(storageType) === false) {
      throw new Error("unrecognized_storeage_type");
    }

    if (storageType === "local") {
      this.#storageApi = window.localStorage;
    } else {
      this.#storageApi = window.sessionStorage;
    }
  }

  getItem(rawKey: string): T | null {
    const key = this.formatKey(rawKey);
    const stringifiedValue = this.#storageApi.getItem(key);

    if (stringifiedValue === null) {
      return null;
    } else {
      return JSON.parse(stringifiedValue);
    }
  }

  setItem(rawKey: string, value: T) {
    const key = this.formatKey(rawKey);
    const stringifiedValue = JSON.stringify(value);
    this.#storageApi.setItem(key, stringifiedValue);
  }

  removeItem(rawKey: string) {
    const key = this.formatKey(rawKey);
    const value = this.getItem(rawKey);
    this.#storageApi.removeItem(key);

    return value;
  }

  clear() {
    const keys = this.getKeys();
    keys.forEach((key) => {
      this.#storageApi.removeItem(key);
    });

    return keys.length;
  }

  export() {
    const outputObject: { [key: string]: any } = {};
    const keys = this.getKeys();
    keys.forEach((key) => {
      const value = this.#storageApi.getItem(key);
      const rawKey = this.parseKey(key);

      if (value !== null) {
        outputObject[rawKey] = JSON.parse(value);
      }
    });

    return outputObject;
  }

  getKeys() {
    const keys: string[] = [];

    for (let i = 0; i < this.#storageApi.length; i++) {
      const key = this.#storageApi.key(i);

      if (key === null) {
        continue;
      } else if (key.indexOf(this.formatKey("")) === 0) {
        keys.push(key);
      }
    }

    return keys;
  }

  private formatKey(rawKey: string) {
    return `BS@${this.#storageId}#${rawKey}`;
  }

  private parseKey(key: string) {
    return key.slice(`BS@${this.#storageId}#`.length);
  }

  static isStorageEnabled(storageType: BrowserStorageType) {
    const key = "_-test_key-_";
    let storageApi: Storage;

    if (storageType === "local") {
      storageApi = window.localStorage;
    } else if (storageType === "session") {
      storageApi = window.sessionStorage;
    } else {
      return false;
    }

    try {
      storageApi.setItem(key, "");
      storageApi.removeItem(key);
    } catch (error) {
      return false;
    }

    return true;
  }
}
