import { makeObservable, observable, runInAction } from "mobx";
import type {
  IconifyInfo,
  IconifyJSON,
  ExtendedIconifyIcon,
} from "@iconify/types";

interface APIv2CollectionResponse {
  // Icon set prefix
  prefix: string;

  // Number of icons (duplicate of info?.total)
  total: number;

  // Icon set title, if available (duplicate of info?.name)
  title?: string;

  // Icon set info
  info?: IconifyInfo;

  // List of icons without categories
  uncategorized?: string[];

  // List of icons, sorted by category
  categories?: Record<string, string[]>;

  // List of hidden icons
  hidden?: string[];

  // List of aliases, key = alias, value = parent icon
  aliases?: Record<string, string>;

  // Characters, key = character, value = icon name
  chars?: Record<string, string>;

  // Themes
  themes?: IconifyJSON["themes"];
  prefixes?: IconifyJSON["prefixes"];
  suffixes?: IconifyJSON["suffixes"];
}

export class IconData {
  constructor() {
    //makeObservable(this);
  }

  async fetchInfos() {
    if (this.infos.size) {
      return;
    }

    const collections = await fetch(
      `https://api.iconify.design/collections`
    ).then((res) => res.json());

    runInAction(() => {
      for (const key in collections) {
        this.infos.set(key, collections[key]);
      }
    });
  }

  async fetchIconNames(prefix: string) {
    if (this.iconNames.has(prefix)) {
      return;
    }

    const json: APIv2CollectionResponse = await fetch(
      `https://api.iconify.design/collection?prefix=${prefix}`
    ).then((res) => res.json());

    runInAction(() => {
      const names = [
        ...(json.uncategorized ?? []),
        ...Object.values(json.categories ?? {}).flat(),
      ];
      this.iconNames.set(prefix, names);
    });
  }

  async fetchIcons(prefix: string, names: string[]) {
    const namesToLoad = names.filter(
      (name) => !this.icons.has(prefix + ":" + name)
    );
    if (namesToLoad.length === 0) {
      return;
    }

    const json: IconifyJSON = await fetch(
      `https://api.iconify.design/${prefix}.json?icons=${namesToLoad.join(",")}`
    ).then((res) => res.json());

    runInAction(() => {
      for (const [key, icon] of Object.entries(json.icons)) {
        this.icons.set(prefix + ":" + key, {
          ...icon,
          width: json.width ?? 24,
          height: json.height ?? 24,
        });
      }
    });
  }

  readonly infos = observable.map<string, IconifyInfo>();
  readonly icons = observable.map<string, ExtendedIconifyIcon>();
  readonly iconNames = observable.map<string, string[]>();
}

export const iconData = new IconData();
