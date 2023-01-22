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

export class IconCollection {
  constructor(prefix: string, data: APIv2CollectionResponse) {
    this.prefix = prefix;
    this.data = data;
  }

  readonly prefix: string;
  readonly data: APIv2CollectionResponse;

  get iconNames(): string[] {
    return [
      ...(this.data.uncategorized ?? []),
      ...Object.values(this.data.categories ?? {}).flat(),
    ];
  }

  searchIconNames(query: string): string[] {
    if (query.match(/^\s*$/)) {
      return this.iconNames;
    }

    const tokens = query.toLocaleLowerCase().trim().split(" ");
    const result = new Set<string>();

    for (const token of tokens) {
      for (const name of this.iconNames) {
        if (name.toLowerCase().includes(token)) {
          result.add(name);
        }
      }
      for (const [alias, name] of Object.entries(this.data.aliases ?? {})) {
        if (alias.toLowerCase().includes(token)) {
          result.add(name);
        }
      }
    }

    return [...result];
  }
}

export class IconData {
  constructor() {
    //makeObservable(this);
  }

  async fetchCollectionInfos() {
    if (this.collectionInfos.size) {
      return;
    }

    const collections = await fetch(
      `https://api.iconify.design/collections`
    ).then((res) => res.json());

    runInAction(() => {
      for (const key in collections) {
        this.collectionInfos.set(key, collections[key]);
      }
    });
  }

  async fetchCollection(prefix: string) {
    if (this.collections.has(prefix)) {
      return;
    }

    const json: APIv2CollectionResponse = await fetch(
      `https://api.iconify.design/collection?prefix=${prefix}`
    ).then((res) => res.json());

    runInAction(() => {
      this.collections.set(prefix, new IconCollection(prefix, json));
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

  readonly collectionInfos = observable.map<string, IconifyInfo>();
  readonly icons = observable.map<string, ExtendedIconifyIcon>();
  readonly collections = observable.map<string, IconCollection>();

  searchCollectionInfos(query: string): [string, IconifyInfo][] {
    if (query.match(/^\s*$/)) {
      return Array.from(this.collectionInfos);
    }

    const tokens = query.toLocaleLowerCase().trim().split(" ");
    const result: [string, IconifyInfo][] = [];

    for (const token of tokens) {
      for (const [prefix, info] of this.collectionInfos) {
        if (info.name?.toLowerCase().includes(token)) {
          result.push([prefix, info]);
          continue;
        }
        if (prefix.toLowerCase().includes(token)) {
          result.push([prefix, info]);
          continue;
        }
      }
    }

    return result;
  }
}

export const iconData = new IconData();
