import { makeObservable, observable, runInAction } from "mobx";
import type { IconifyInfo } from "@iconify/types";

export class IconData {
  constructor() {
    makeObservable(this);
  }

  async fetchCollections() {
    if (this.collections.size) {
      return;
    }

    const collections = await fetch(
      "https://unpkg.com/@iconify/json/collections.json"
    ).then((res) => res.json());

    runInAction(() => {
      for (const key in collections) {
        this.collections.set(key, collections[key]);
      }
    });
  }

  readonly collections = observable.map<string, IconifyInfo>();
}

export const iconData = new IconData();
