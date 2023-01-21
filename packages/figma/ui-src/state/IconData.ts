import { makeObservable, observable, runInAction } from "mobx";
import type { IconifyInfo, IconifyJSON } from "@iconify/types";

export class IconData {
  constructor() {
    //makeObservable(this);
  }

  async fetchInfos() {
    if (this.infos.size) {
      return;
    }

    const collections = await fetch(
      "https://unpkg.com/@iconify/json/collections.json"
    ).then((res) => res.json());

    runInAction(() => {
      for (const key in collections) {
        this.infos.set(key, collections[key]);
      }
    });
  }

  async fetchCollection(prefix: string) {
    if (this.collections.has(prefix)) {
      return;
    }

    const collection = await fetch(
      `https://unpkg.com/@iconify/json/json/${prefix}.json`
    ).then((res) => res.json());

    runInAction(() => {
      this.collections.set(prefix, collection);
    });
  }

  readonly infos = observable.map<string, IconifyInfo>();
  readonly collections = observable.map<string, IconifyJSON>();
}

export const iconData = new IconData();
