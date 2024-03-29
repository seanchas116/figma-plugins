import { observable, runInAction } from "mobx";
import type {
  IconifyInfo,
  IconifyJSON,
  ExtendedIconifyIcon,
} from "@iconify/types";
import { QueryTester } from "../util/QueryTester";

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

    const suffixes = Object.keys(data.suffixes ?? { "": "" }).sort(
      (a, b) => b.length - a.length
    );

    const allNames = new Set([
      ...(data.uncategorized ?? []),
      ...Object.values(data.categories ?? {}).flat(),
    ]);

    for (const suffix of suffixes) {
      this.namesForSuffix.set(suffix, []);
    }

    for (const name of allNames) {
      for (const suffix of suffixes) {
        if (name.endsWith(suffix)) {
          this.namesForSuffix.get(suffix)?.push(name);
          break;
        }
      }
    }
  }

  readonly prefix: string;
  readonly data: APIv2CollectionResponse;
  readonly namesForSuffix = new Map<string, string[]>();

  // get iconNames(): string[] {
  //   return [
  //     ...(this.data.uncategorized ?? []),
  //     ...Object.values(this.data.categories ?? {}).flat(),
  //   ];
  // }

  searchIconNames(query: string, suffix: string): string[] {
    if (query.match(/^\s*$/)) {
      return this.namesForSuffix.get(suffix) ?? [];
    }

    const tester = new QueryTester(query);
    const result = new Set<string>();

    for (const name of this.namesForSuffix.get(suffix) ?? []) {
      if (tester.test(name)) {
        result.add(name);
      }
    }
    for (const [alias, name] of Object.entries(this.data.aliases ?? {})) {
      if (tester.test(alias)) {
        result.add(name);
      }
    }

    return [...result].filter((name) => name.endsWith(suffix));
  }

  get suffixes(): {
    suffix: string;
    name: string;
  }[] {
    return Object.entries(this.data.suffixes ?? {}).map(([suffix, name]) => ({
      suffix,
      name,
    }));
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

  async fetchCollection(prefix: string): Promise<IconCollection> {
    const existing = this.collections.get(prefix);
    if (existing) {
      return existing;
    }

    const json: APIv2CollectionResponse = await fetch(
      `https://api.iconify.design/collection?prefix=${prefix}`
    ).then((res) => res.json());

    const collection = new IconCollection(prefix, json);
    runInAction(() => {
      this.collections.set(prefix, collection);
    });
    return collection;
  }

  async fetchIcons(names: string[]) {
    const namesToLoad = names.filter((name) => !this.icons.has(name));
    if (namesToLoad.length === 0) {
      return;
    }

    const unprefixedNames = new Map<string, string[]>();

    for (const name of namesToLoad) {
      const [prefix, iconName] = name.split(":");
      if (!unprefixedNames.has(prefix)) {
        unprefixedNames.set(prefix, []);
      }
      unprefixedNames.get(prefix)?.push(iconName);
    }

    const jsons: IconifyJSON[] = await Promise.all(
      Array.from(unprefixedNames.entries()).map(([prefix, names]) => {
        return fetch(
          `https://api.iconify.design/${prefix}.json?icons=${names.join(",")}`
        ).then((res) => res.json());
      })
    );

    runInAction(() => {
      for (const json of jsons) {
        let height = this.collectionInfos.get(json.prefix)?.height;
        if (!(typeof height === "number")) {
          height = 24;
        }

        for (const [key, icon] of Object.entries(json.icons)) {
          this.icons.set(json.prefix + ":" + key, {
            ...icon,
            width: icon.width ?? json.width ?? height,
            height: icon.height ?? json.height ?? height,
          });
        }
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

    const tester = new QueryTester(query);
    const result: [string, IconifyInfo][] = [];

    for (const [prefix, info] of this.collectionInfos) {
      if (info.name && tester.test(info.name)) {
        result.push([prefix, info]);
        continue;
      }
      if (tester.test(prefix)) {
        result.push([prefix, info]);
        continue;
      }
    }

    return result;
  }

  async searchAllIcon(query: string): Promise<string[]> {
    if (query === "") {
      return [];
    }

    const response: APIv2SearchResponse = await (
      await fetch(`https://api.iconify.design/search?query=${query}&limit=999`)
    ).json();

    return response.icons;
  }
}

export const iconData = new IconData();

export interface APIv2SearchResponse {
  // List of icons, including prefixes
  icons: string[];

  // Number of results. If same as `limit`, more results are available
  total: number;

  // Number of results shown
  limit: number;

  // Index of first result
  start: number;

  // Info about icon sets
  collections: Record<string, IconifyInfo>;

  // Copy of request, values are string
  //request: Record<keyof APIv2SearchParams, string>;
}
